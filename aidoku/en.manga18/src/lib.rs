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
        html::Document,
        net::Request,
        std::{parse_date_with_options, send_partial_result},
    },
    prelude::*,
};

const DEFAULT_BASE_URL: &str = "https://manga18fx.com";
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
        let start = url.find("/manga/")?;
        Some(url[start..].trim_end_matches('/').into())
    }

    fn manga_url(base_url: &str, key: &str) -> String {
        if key.starts_with("http://") || key.starts_with("https://") {
            key.into()
        } else {
            format!("{base_url}{key}")
        }
    }

    fn parse_entries(document: &Document) -> Vec<Manga> {
        document
            .select(".bsx-item")
            .map(|items| {
                items
                    .filter_map(|item| {
                        let link = item
                            .select_first("h3.tt a")
                            .or_else(|| item.select_first("a[title]"))?;
                        let url = link.attr("abs:href")?;
                        let key = Self::key_from_url(&url)?;
                        let title = link.attr("title").or_else(|| link.text())?;
                        let cover = item.select_first("img").and_then(|img| {
                            img.attr("abs:data-src").or_else(|| img.attr("abs:src"))
                        });
                        let content_rating = if item.select_first(".adult-badges").is_some() {
                            ContentRating::NSFW
                        } else {
                            ContentRating::Safe
                        };
                        Some(Manga {
                            key,
                            title,
                            cover,
                            url: Some(url),
                            content_rating,
                            viewer: Viewer::Webtoon,
                            ..Default::default()
                        })
                    })
                    .collect()
            })
            .unwrap_or_default()
    }

    fn has_next_page(document: &Document) -> bool {
        document
            .select("a")
            .map(|links| {
                links
                    .filter_map(|link| link.text())
                    .any(|text| text.trim() == "»")
            })
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
            .select("#chapterlist .chapter-name")
            .map(|links| {
                links
                    .filter_map(|link| {
                        let url = link.attr("abs:href")?;
                        let key = Self::key_from_url(&url)?;
                        let text = link.text()?;
                        let date_uploaded = link
                            .parent()
                            .and_then(|parent| parent.select_first(".chapter-time"))
                            .and_then(|date| date.text())
                            .and_then(|date| {
                                parse_date_with_options(&date, "dd MMM yy", "en_US", "current")
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
                format!("{base_url}/page/{page}")
            }),
            "popular" => Some(if page <= 1 {
                format!("{base_url}/hot-manga")
            } else {
                format!("{base_url}/hot-manga?page={page}")
            }),
            "manhwa" | "manhua" => Some(if page <= 1 {
                format!("{base_url}/manga-genre/{id}")
            } else {
                format!("{base_url}/manga-genre/{id}/{page}")
            }),
            _ => None,
        }
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
                let mut url = format!("{base_url}/search?q={}", encode_uri_component(query));
                if page > 1 {
                    url.push_str(&format!("&page={page}"));
                }
                url
            }
            None => match genre {
                Some(genre) => {
                    if page <= 1 {
                        format!("{base_url}/manga-genre/{genre}")
                    } else {
                        format!("{base_url}/manga-genre/{genre}/{page}")
                    }
                }
                None => {
                    if page <= 1 {
                        format!("{base_url}/")
                    } else {
                        format!("{base_url}/page/{page}")
                    }
                }
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
                .select_first("h1")
                .and_then(|element| element.text())
                .unwrap_or(manga.title);
            manga.cover = document
                .select_first(".summary_image img")
                .and_then(|img| img.attr("abs:data-src").or_else(|| img.attr("abs:src")))
                .or_else(|| {
                    document
                        .select_first("meta[property='og:image']")
                        .and_then(|meta| meta.attr("content"))
                });
            manga.authors = document
                .select(".author-content a")
                .map(|elements| elements.filter_map(|element| element.text()).collect());
            manga.artists = document
                .select(".artist-content a")
                .map(|elements| elements.filter_map(|element| element.text()).collect());
            manga.tags = document
                .select(".genres-content a")
                .map(|elements| elements.filter_map(|element| element.text()).collect());
            manga.description = document
                .select_first(".dsct")
                .and_then(|element| element.text())
                .or_else(|| {
                    document
                        .select_first(".summary_content p")
                        .and_then(|element| element.text())
                });
            let status = document
                .select(".post-status .post-content_item")
                .and_then(|items| items.get(1))
                .and_then(|item| item.select_first(".summary-content"))
                .and_then(|element| element.text())
                .unwrap_or_default()
                .to_ascii_lowercase();
            manga.status = match status.trim() {
                "ongoing" => MangaStatus::Ongoing,
                "completed" => MangaStatus::Completed,
                "canceled" | "cancelled" => MangaStatus::Cancelled,
                "on hold" | "hiatus" => MangaStatus::Hiatus,
                _ => MangaStatus::Unknown,
            };
            manga.content_rating = if document.select_first("body.adult-content").is_some()
                || document.select_first(".adult-badges").is_some()
            {
                ContentRating::NSFW
            } else {
                ContentRating::Safe
            };
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
        let document = self.request(chapter_url)?.html()?;
        let images = document
            .select(".read-content .page-break img")
            .or_else(|| document.select(".read-content img"))
            .ok_or_else(|| error!("Failed to find chapter pages"))?;
        Ok(images
            .filter_map(|image| {
                let url = image
                    .attr("abs:data-src")
                    .or_else(|| image.attr("abs:src"))?;
                Some(Page {
                    content: PageContent::url(url),
                    ..Default::default()
                })
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
        let Some(start) = url.find("/manga/") else {
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
