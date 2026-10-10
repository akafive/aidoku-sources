#![no_std]

#[cfg(not(target_family = "wasm"))]
extern crate std;
#[cfg(not(target_family = "wasm"))]
#[global_allocator]
static HOST_ALLOCATOR: std::alloc::System = std::alloc::System;

use aidoku::{
	BaseUrlProvider, Chapter, ContentRating, DeepLinkHandler, DeepLinkResult, FilterValue,
	ImageRequestProvider, Listing, ListingProvider, Manga, MangaPageResult, MangaStatus, Page,
	PageContent, PageContext, Result, Source, Viewer,
	alloc::{format, string::String, vec::Vec},
	helpers::uri::encode_uri_component,
	imports::{
		defaults::defaults_get,
		html::{Document, Html},
		net::Request,
		std::{parse_date_with_options, send_partial_result},
	},
	prelude::*,
};

const DEFAULT_BASE_URL: &str = "https://manga18.club";
const USER_AGENT: &str =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/135.0 Safari/537.36";

struct Manga18;

impl Manga18 {
	fn base_url(&self) -> String {
		defaults_get::<String>("url")
			.filter(|url| !url.is_empty())
			.unwrap_or_else(|| DEFAULT_BASE_URL.into())
	}

	fn request(&self, url: String) -> Result<Request> {
		Ok(Request::get(url)?
			.header("User-Agent", USER_AGENT)
			.header("Cookie", "manga18-mature=1"))
	}

	fn key_from_url(url: &str) -> Option<String> {
		let start = url.find("/manhwa/")?;
		Some(url[start..].trim_end_matches('/').into())
	}

	fn manga_url(base_url: &str, key: &str) -> String {
		if key.starts_with("http://") || key.starts_with("https://") {
			key.into()
		} else {
			format!("{base_url}{key}")
		}
	}

	/// Skips items inside the popular slider (owl carousel) or the top
	/// ranking sidebar so listings only contain the main grid.
	fn is_promoted(item: &aidoku::imports::html::Element) -> bool {
		let mut current = item.parent();
		let mut depth = 0;
		while let Some(element) = current {
			if let Some(class) = element.attr("class") {
				if class.contains("owl-") || class.contains("mg-item_hoz") {
					return true;
				}
			}
			depth += 1;
			if depth > 8 {
				break;
			}
			current = element.parent();
		}
		false
	}

	fn parse_entries(document: &Document) -> Vec<Manga> {
		let Some(items) = document.select(".story_item") else {
			return Vec::new();
		};
		let mut entries: Vec<Manga> = Vec::new();
		for item in items {
			if Self::is_promoted(&item) {
				continue;
			}
			let Some(link) = item
				.select_first(".story_images a")
				.filter(|link| {
					link.attr("abs:href")
						.is_some_and(|href| href.contains("/manhwa/"))
				})
				.or_else(|| {
					item.select_first(".mg_name a")
						.or_else(|| item.select_first(".story_name a"))
				})
			else {
				continue;
			};
			let Some(url) = link.attr("abs:href") else {
				continue;
			};
			let Some(key) = Self::key_from_url(&url) else {
				continue;
			};
			if entries.iter().any(|manga| manga.key == key) {
				continue;
			}
			let title = link
				.attr("title")
				.filter(|title| !title.is_empty())
				.or_else(|| {
					item.select_first(".mg_name a")
						.or_else(|| item.select_first(".story_name a"))
						.and_then(|name| name.text())
				})
				.or_else(|| link.text());
			let Some(title) = title.filter(|title| !title.trim().is_empty()) else {
				continue;
			};
			let cover = item.select_first(".story_images img").and_then(|img| {
				img.attr("abs:data-src")
					.or_else(|| img.attr("abs:src"))
					.filter(|url| !url.starts_with("data:"))
			});
			entries.push(Manga {
				key,
				title: title.trim().into(),
				cover,
				url: Some(url),
				content_rating: ContentRating::NSFW,
				viewer: Viewer::Webtoon,
				..Default::default()
			});
		}
		entries
	}

	fn has_next_page(document: &Document) -> bool {
		document
			.select(".pagination a")
			.map(|links| links.filter_map(|link| link.text()).any(|text| text.trim() == "»"))
			.unwrap_or(false)
	}

	fn parse_chapter_number(text: &str) -> Option<f32> {
		text.trim()
			.strip_prefix("Chapter")
			.and_then(|number| number.split_whitespace().next())
			.and_then(|number| number.parse().ok())
	}

	fn parse_chapters(document: &Document) -> Vec<Chapter> {
		document
			.select(".chapter_box a.chapter_num")
			.map(|links| {
				links
					.filter_map(|link| {
						let url = link.attr("abs:href")?;
						let key = Self::key_from_url(&url)?;
						let text = link.text()?;
						let date_uploaded = link
							.parent()
							.and_then(|parent| parent.select_first(".chapter_info"))
							.and_then(|date| date.text())
							.and_then(|date| {
								parse_date_with_options(
									date.trim(),
									"dd-MM-yyyy",
									"en_US",
									"UTC",
								)
							});
						let chapter_number = Self::parse_chapter_number(&text);
						Some(Chapter {
							key,
							chapter_number,
							title: if chapter_number.is_some() {
								None
							} else {
								Some(text)
							},
							date_uploaded,
							url: Some(url),
							..Default::default()
						})
					})
					.collect()
			})
			.unwrap_or_default()
	}

	fn info_value(
		document: &Document,
		label: &str,
	) -> Option<aidoku::imports::html::Element> {
		document.select(".detail_listInfo .item").and_then(|mut items| {
			items.find(|item| {
				item.select_first(".info_label")
					.and_then(|label_el| label_el.text())
					.is_some_and(|text| text.to_ascii_lowercase().contains(label))
			})
		})
	}

	fn genre_filter(filters: &[FilterValue]) -> Option<String> {
		filters.iter().find_map(|filter| match filter {
			FilterValue::Select { id, value } if id == "genre" && !value.is_empty() => {
				Some(value.clone())
			}
			FilterValue::MultiSelect { id, included, .. }
				if id == "genre" && !included.is_empty() =>
			{
				included.first().cloned()
			}
			_ => None,
		})
	}

	fn listing_url(base_url: &str, id: &str, page: i32) -> Option<String> {
		match id {
			"latest" => Some(if page <= 1 {
				format!("{base_url}/")
			} else {
				format!("{base_url}/latest-release/{page}")
			}),
			"all" => Some(if page <= 1 {
				format!("{base_url}/list-manga")
			} else {
				format!("{base_url}/list-manga/{page}")
			}),
			"manhwa" | "manhua" => {
				let slug = if id == "manhwa" { "Manhwa" } else { "Manhua" };
				Some(if page <= 1 {
					format!("{base_url}/manga-list/{slug}")
				} else {
					format!("{base_url}/manga-list/{slug}/{page}")
				})
			}
			_ => None,
		}
	}

	fn decode_base64(input: &str) -> Option<String> {
		const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		let mut output = Vec::new();
		let mut buffer: u32 = 0;
		let mut bits = 0;
		for byte in input.bytes() {
			if byte == b'=' {
				break;
			}
			let Some(value) = TABLE.iter().position(|&c| c == byte) else {
				continue;
			};
			buffer = (buffer << 6) | value as u32;
			bits += 6;
			if bits >= 8 {
				bits -= 8;
				output.push((buffer >> bits) as u8);
			}
		}
		String::from_utf8(output).ok()
	}

	/// Chapter images are not in the HTML directly; the page embeds them as a
	/// base64-encoded JS array: `var slides_p_path = ["aHR0...", ...];`
	fn parse_page_urls(html: &str) -> Vec<String> {
		let Some(start) = html.find("slides_p_path") else {
			return Vec::new();
		};
		let rest = &html[start..];
		let Some(open) = rest.find('[') else {
			return Vec::new();
		};
		let Some(close) = rest[open..].find(']') else {
			return Vec::new();
		};
		let array = &rest[open + 1..open + close];
		array
			.split('"')
			.filter(|part| {
				!part.trim().is_empty()
					&& part
						.trim_start_matches(|c: char| c == ',' || c.is_whitespace())
						.chars()
						.next()
						.is_some_and(|c| c.is_ascii_alphanumeric())
					&& !part.contains(',')
			})
			.filter_map(Self::decode_base64)
			.filter(|url| url.starts_with("http"))
			.collect()
	}
}

impl Source for Manga18 {
	fn new() -> Self {
		Self
	}

	fn get_search_manga_list(
		&self,
		query: Option<String>,
		page: i32,
		filters: Vec<FilterValue>,
	) -> Result<MangaPageResult> {
		let base_url = self.base_url();
		let genre = Self::genre_filter(&filters);
		let url = match query
			.as_deref()
			.map(str::trim)
			.filter(|query| !query.is_empty())
		{
			Some(query) => {
				if page <= 1 {
					format!("{base_url}/list-manga?search={}", encode_uri_component(query))
				} else {
					format!(
						"{base_url}/list-manga/?search={}&page={page}",
						encode_uri_component(query)
					)
				}
			}
			None => match genre {
				Some(genre) => {
					if page <= 1 {
						format!("{base_url}/manga-list/{genre}")
					} else {
						format!("{base_url}/manga-list/{genre}/{page}")
					}
				}
				None => Self::listing_url(&base_url, "latest", page)
					.ok_or_else(|| error!("Missing listing URL"))?,
			},
		};
		let document = self.request(url)?.html()?;
		let entries = Self::parse_entries(&document);
		Ok(MangaPageResult {
			has_next_page: Self::has_next_page(&document),
			entries,
		})
	}

	fn get_manga_update(
		&self,
		mut manga: Manga,
		needs_details: bool,
		needs_chapters: bool,
	) -> Result<Manga> {
		let base_url = self.base_url();
		let manga_url = Self::manga_url(&base_url, &manga.key);
		let document = self.request(manga_url.clone())?.html()?;

		if needs_details {
			manga.title = document
				.select_first(".detail_name h1")
				.or_else(|| document.select_first("h1"))
				.and_then(|element| element.text())
				.map(|title| title.trim().into())
				.unwrap_or(manga.title);
			manga.cover = document
				.select_first(".detail_avatar img")
				.and_then(|img| img.attr("abs:data-src").or_else(|| img.attr("abs:src")))
				.or_else(|| {
					document
						.select_first("meta[property='og:image']")
						.and_then(|meta| meta.attr("content"))
				});
			manga.authors = Self::info_value(&document, "author").map(|value| {
				value
					.select("a")
					.map(|links| links.filter_map(|link| link.text()).collect())
					.unwrap_or_default()
			});
			manga.artists = Self::info_value(&document, "artist").map(|value| {
				value
					.select("a")
					.map(|links| links.filter_map(|link| link.text()).collect())
					.unwrap_or_default()
			});
			manga.tags = Self::info_value(&document, "categories").map(|value| {
				value
					.select("a")
					.map(|links| links.filter_map(|link| link.text()).collect())
					.unwrap_or_default()
			});
			manga.description = document
				.select_first(".detail_reviewContent")
				.and_then(|element| element.text())
				.map(|text| text.trim().into())
				.or_else(|| {
					document
						.select_first("meta[property='og:description']")
						.and_then(|meta| meta.attr("content"))
				});
			let status = Self::info_value(&document, "status")
				.and_then(|value| value.text())
				.unwrap_or_default()
				.to_ascii_lowercase();
			manga.status = match status.trim() {
				s if s.contains("on going") || s.contains("ongoing") => MangaStatus::Ongoing,
				s if s.contains("completed") => MangaStatus::Completed,
				s if s.contains("cancel") || s.contains("dropped") => MangaStatus::Cancelled,
				s if s.contains("hold") || s.contains("hiatus") => MangaStatus::Hiatus,
				_ => MangaStatus::Unknown,
			};
			manga.content_rating = ContentRating::NSFW;
			manga.viewer = Viewer::Webtoon;
			manga.url = Some(manga_url.clone());

			if needs_chapters {
				send_partial_result(&manga);
			}
		}

		if needs_chapters {
			manga.chapters = Some(Self::parse_chapters(&document));
		}
		Ok(manga)
	}

	fn get_page_list(&self, _manga: Manga, chapter: Chapter) -> Result<Vec<Page>> {
		let base_url = self.base_url();
		let chapter_url = Self::manga_url(&base_url, &chapter.key);
		let html = self.request(chapter_url.clone())?.string()?;
		let mut urls = Self::parse_page_urls(&html);
		if urls.is_empty() {
			// Fallback in case images are ever rendered server-side again
			let document = Html::parse_with_url(&html, &chapter_url)?;
			urls = document
				.select("img.image-chapter")
				.map(|images| {
					images
						.filter_map(|img| {
							img.attr("abs:data-src")
								.or_else(|| img.attr("abs:src"))
								.filter(|url| !url.starts_with("data:"))
						})
						.collect()
				})
				.unwrap_or_default();
		}
		if urls.is_empty() {
			return Err(error!("Failed to find chapter pages"));
		}
		Ok(urls
			.into_iter()
			.map(|url| Page {
				content: PageContent::url(url),
				..Default::default()
			})
			.collect())
	}
}

impl ListingProvider for Manga18 {
	fn get_manga_list(&self, listing: Listing, page: i32) -> Result<MangaPageResult> {
		let base_url = self.base_url();
		let url = Self::listing_url(&base_url, &listing.id, page)
			.ok_or_else(|| error!("Unknown listing: {}", listing.id))?;
		let document = self.request(url)?.html()?;
		Ok(MangaPageResult {
			entries: Self::parse_entries(&document),
			has_next_page: Self::has_next_page(&document),
		})
	}
}

impl ImageRequestProvider for Manga18 {
	fn get_image_request(&self, url: String, _context: Option<PageContext>) -> Result<Request> {
		let base_url = self.base_url();
		Ok(Request::get(url)?
			.header("User-Agent", USER_AGENT)
			.header("Referer", &format!("{base_url}/"))
			.header("Cookie", "manga18-mature=1"))
	}
}

impl DeepLinkHandler for Manga18 {
	fn handle_deep_link(&self, url: String) -> Result<Option<DeepLinkResult>> {
		let Some(start) = url.find("/manhwa/") else {
			return Ok(None);
		};
		let path = url[start..].trim_end_matches('/');
		if let Some(chapter_start) = path.find("/chapter-") {
			return Ok(Some(DeepLinkResult::Chapter {
				manga_key: path[..chapter_start].into(),
				key: path.into(),
			}));
		}
		Ok(Some(DeepLinkResult::Manga { key: path.into() }))
	}
}

impl BaseUrlProvider for Manga18 {
	fn get_base_url(&self) -> Result<String> {
		Ok(self.base_url())
	}
}

register_source!(
	Manga18,
	ListingProvider,
	ImageRequestProvider,
	DeepLinkHandler,
	BaseUrlProvider
);
