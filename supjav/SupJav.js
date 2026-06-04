WidgetMetadata = {
  id: "forward.supjav",
  title: "SupJav",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "浏览和搜索 SupJav 公开影片页面，并从详情页解析公开播放资源",
  author: "Forward",
  site: "https://supjav.com/",
  detailCacheDuration: 1800,
  globalParams: [
    {
      name: "baseUrl",
      title: "站点地址",
      type: "input",
      value: "https://supjav.com",
      placeholders: [
        { title: "SupJav", value: "https://supjav.com" },
      ],
    },
    {
      name: "cookie",
      title: "Cookie",
      type: "input",
      description: "可选。当前网络需要 Cookie 时填写，不要分享给他人。",
      value: "",
    },
  ],
  modules: [
    {
      id: "latest",
      title: "最新影片",
      functionName: "latest",
      cacheDuration: 1800,
      params: [pageParam()],
    },
    {
      id: "popular",
      title: "热门/推荐",
      functionName: "popular",
      cacheDuration: 1800,
      params: [
        {
          name: "path",
          title: "路径",
          type: "input",
          value: "/",
          description: "SupJav 的热门路径可能随镜像变化；默认读取首页",
        },
        pageParam(),
      ],
    },
    {
      id: "category",
      title: "分类/标签",
      functionName: "category",
      cacheDuration: 1800,
      params: [
        {
          name: "path",
          title: "路径",
          type: "input",
          value: "/",
          description: "例如 /category/.../、/tag/.../ 或任意列表路径",
        },
        pageParam(),
      ],
    },
    {
      id: "detail",
      title: "详情解析",
      functionName: "detail",
      cacheDuration: 1800,
      params: [
        {
          name: "link",
          title: "详情页链接",
          type: "input",
          value: "",
        },
      ],
    },
    {
      id: "loadResource",
      title: "加载资源",
      functionName: "loadResource",
      type: "stream",
      params: [],
    },
  ],
  search: {
    title: "搜索",
    functionName: "search",
    params: [
      {
        name: "keyword",
        title: "关键词",
        type: "input",
        description: "搜索关键词",
      },
      pageParam(),
    ],
  },
};

function pageParam() {
  return {
    name: "page",
    title: "页码",
    type: "page",
    value: "1",
  };
}

async function latest(params = {}) {
  return fetchList(buildPagedUrl("/", params), params);
}

async function popular(params = {}) {
  return fetchList(buildPagedUrl(params.path || "/", params), params);
}

async function category(params = {}) {
  const path = params.genreId || params.path || "/";
  return fetchList(buildPagedUrl(path, params), params);
}

async function search(params = {}) {
  const keyword = cleanText(params.keyword || params.query || "");
  if (!keyword) throw new Error("请输入搜索关键词");
  return fetchList(buildSearchUrl(keyword, params), params);
}

async function detail(params = {}) {
  const link = params.link || params.id;
  if (!link) throw new Error("缺少详情页链接");
  return resolveDetailPage(absoluteUrl(link, getBaseUrl(params)), params);
}

async function loadDetail(link) {
  if (!link) return null;
  return resolveDetailPage(absoluteUrl(link, getBaseUrl({})), {});
}

async function loadResource(params = {}) {
  const link = params.link || params.id;
  if (!link) throw new Error("缺少详情页链接");
  const info = await resolveDetailPage(absoluteUrl(link, getBaseUrl(params)), params);
  if (!info.videoUrl) {
    throw new Error("未在详情页找到公开 mp4/m3u8 播放地址；页面可能需要浏览器校验、登录、或只提供第三方嵌入播放器。");
  }
  return [
    {
      name: info.title || "SupJav",
      description: describeResource(info.videoUrl),
      url: info.videoUrl,
      headers: info.videoReferer ? { Referer: info.videoReferer } : undefined,
    },
  ].map(compactObject);
}

async function fetchList(pathOrUrl, params = {}) {
  const url = absoluteUrl(pathOrUrl, getBaseUrl(params));
  const response = await requestHtml(url, params);
  return parseListHtml(response.data, url);
}

async function resolveDetailPage(url, params = {}) {
  const response = await requestHtml(url, params);
  const info = parseDetailHtml(response.data, url);
  if (info.videoUrl || !info.embedUrl) return info;

  try {
    const embedResponse = await requestHtml(info.embedUrl, Object.assign({}, params, { referer: url }));
    const videoUrl = absoluteUrl(extractVideoUrl(embedResponse.data), info.embedUrl);
    if (!videoUrl) return info;
    return compactObject(Object.assign({}, info, {
      videoUrl,
      videoReferer: info.embedUrl,
    }));
  } catch (error) {
    console.error("[supjav] 嵌入播放器解析失败:", error.message || error);
    return info;
  }
}

async function requestHtml(url, params = {}) {
  const response = await Widget.http.get(url, {
    headers: defaultHeaders(params.referer || url, params),
  });
  if (!response || response.data === undefined || response.data === null) {
    throw new Error("获取页面失败");
  }
  const html = String(response.data);
  if (isChallengeHtml(html)) {
    throw new Error("站点返回验证页。请在可访问的网络环境使用，或在参数中配置有效 Cookie/baseUrl；本模块不会绕过验证。");
  }
  return { data: html, status: response.status, headers: response.headers };
}

function parseListHtml(html, pageUrl) {
  if (isChallengeHtml(html)) {
    throw new Error("站点返回验证页，无法解析列表");
  }

  const $ = Widget.html.load(html);
  const seen = {};
  const items = [];
  const cardSelectors = "article, .post, .video, .video-item, .item, .thumb-block, .post-item";
  const cards = $(cardSelectors);

  cards.map((_, card) => {
    const $card = $(card);
    const linkElement = findFirstDetailLink($, $card, pageUrl);
    const imageElement = $card.find("img").first();
    const link = absoluteUrl(linkElement.attr("href"), pageUrl);
    if (!isLikelyDetailLink(link, pageUrl) || seen[link]) return null;

    const title = findBestTitle($, $card, linkElement, imageElement, link);
    if (!title) return null;

    const poster = imageSource(imageElement);
    const durationText = cleanText($card.find(".duration, .video-duration, .time, .label, .meta-duration").first().text());
    const releaseDate = cleanText($card.find("time, .date, .post-date").first().attr("datetime") || $card.find("time, .date, .post-date").first().text());

    seen[link] = true;
    items.push(compactObject({
      id: link,
      type: "url",
      mediaType: "movie",
      title,
      posterPath: absoluteUrl(poster, pageUrl),
      backdropPath: absoluteUrl(poster, pageUrl),
      durationText,
      releaseDate,
      link,
      playerType: "system",
    }));
    return null;
  });

  if (items.length > 0) return items;

  return $("a[href]").map((_, anchor) => {
    const $anchor = $(anchor);
    const link = absoluteUrl($anchor.attr("href"), pageUrl);
    if (!isLikelyDetailLink(link, pageUrl) || seen[link]) return null;
    const title = cleanText($anchor.attr("title") || $anchor.text() || titleFromUrl(link));
    if (!title) return null;
    seen[link] = true;
    return compactObject({
      id: link,
      type: "url",
      mediaType: "movie",
      title,
      link,
      playerType: "system",
    });
  }).get().filter(Boolean);
}

function parseDetailHtml(html, pageUrl) {
  if (isChallengeHtml(html)) {
    throw new Error("站点返回验证页，无法解析详情");
  }

  const $ = Widget.html.load(html);
  const title = cleanText(
    meta($, "og:title")
    || meta($, "twitter:title")
    || $("h1, .entry-title, .post-title, .video-title").first().text()
    || titleFromUrl(pageUrl)
  );
  const description = cleanText(meta($, "og:description") || meta($, "description") || $(".entry-content, .post-content, .content").first().text());
  const poster = absoluteUrl(meta($, "og:image") || meta($, "twitter:image") || imageSource($(".entry-content img, .post-content img, article img, img").first()), pageUrl);
  const videoUrl = absoluteUrl(extractVideoUrl(html), pageUrl);
  const embedUrl = absoluteUrl(extractEmbedUrl($, html), pageUrl);
  const genreItems = parseGenreItems($, pageUrl);
  const relatedItems = parseListHtml(html, pageUrl).filter(item => item.link !== pageUrl).slice(0, 12);

  return compactObject({
    id: pageUrl,
    type: "url",
    mediaType: "movie",
    title,
    description,
    posterPath: poster,
    backdropPath: poster,
    backdropPaths: poster ? [poster] : undefined,
    videoUrl,
    embedUrl,
    genreItems: genreItems.length ? genreItems : undefined,
    relatedItems: relatedItems.length ? relatedItems : undefined,
    link: pageUrl,
    playerType: "system",
  });
}

function findFirstDetailLink($, $scope, pageUrl) {
  const anchors = $scope.find("a[href]");
  let found = null;
  anchors.map((_, anchor) => {
    if (found) return null;
    const $anchor = $(anchor);
    const link = absoluteUrl($anchor.attr("href"), pageUrl);
    if (isLikelyDetailLink(link, pageUrl)) found = $anchor;
    return null;
  });
  return found || anchors.first();
}

function findBestTitle($, $scope, linkElement, imageElement, link) {
  const titleElement = $scope.find(".entry-title a, h1 a, h2 a, h3 a, .title a, .video-title a, .entry-title, h1, h2, h3, .title, .video-title").first();
  const candidates = [
    titleElement.attr("title"),
    titleElement.text(),
    linkElement.attr("title"),
    linkElement.text(),
    imageElement.attr("alt"),
    titleFromUrl(link),
  ];
  return candidates.map(cleanText).find(Boolean) || "";
}

function parseGenreItems($, pageUrl) {
  const seen = {};
  const selectors = "a[rel='category tag'], .tags a, .post-tags a, .cat-links a, .categories a";
  return $(selectors).map((_, anchor) => {
    const $anchor = $(anchor);
    const link = absoluteUrl($anchor.attr("href"), pageUrl);
    const title = cleanText($anchor.text() || $anchor.attr("title"));
    if (!link || !title || seen[link]) return null;
    seen[link] = true;
    return { id: pathAndQuery(link), title };
  }).get().filter(Boolean);
}

function extractVideoUrl(html) {
  const decoded = decodeHtmlEntities(html);
  const patterns = [
    /https?:\\?\/\\?\/[^"'<>\\\s]+?\.mp4[^"'<>\\\s]*/i,
    /https?:\\?\/\\?\/[^"'<>\\\s]+?\.m3u8[^"'<>\\\s]*/i,
    /(?:videoUrl|video_url|hlsUrl|source|src|file)\s*[:=]\s*["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i,
    /<source\b[^>]+src=["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i,
  ];

  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (match) return (match[1] || match[0]).replace(/\\\//g, "/");
  }
  return "";
}

function extractEmbedUrl($, html) {
  const iframe = $("iframe").first().attr("src");
  if (iframe) return iframe;
  const decoded = decodeHtmlEntities(html);
  const match = decoded.match(/<iframe\b[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : "";
}

function imageSource(imageElement) {
  if (!imageElement || !imageElement.attr) return "";
  const srcset = imageElement.attr("data-srcset") || imageElement.attr("srcset") || "";
  return imageElement.attr("data-src")
    || imageElement.attr("data-original")
    || imageElement.attr("data-lazy-src")
    || imageElement.attr("data-thumb")
    || firstSrcFromSrcset(srcset)
    || imageElement.attr("src")
    || "";
}

function firstSrcFromSrcset(srcset) {
  const first = String(srcset || "").split(",").map(part => part.trim()).find(Boolean);
  return first ? first.split(/\s+/)[0] : "";
}

function meta($, name) {
  return $(`meta[property="${name}"]`).attr("content")
    || $(`meta[name="${name}"]`).attr("content")
    || "";
}

function buildSearchUrl(keyword, params = {}) {
  const page = Number(params.page || 1);
  const root = page > 1 ? `/page/${page}/` : "/";
  return appendQuery(absoluteUrl(root, getBaseUrl(params)), "s", keyword);
}

function buildPagedUrl(path, params = {}) {
  const base = getBaseUrl(params);
  const page = Number(params.page || 1);
  const normalized = normalizePath(path || "/");
  const url = absoluteUrl(normalized, base);
  if (!page || page <= 1) return url;
  if (url.indexOf("?") >= 0) return appendQuery(url, "paged", String(page));
  const pagePath = trimTrailingSlash(normalized) === "" || trimTrailingSlash(normalized) === "/"
    ? `/page/${page}/`
    : `${trimTrailingSlash(normalized)}/page/${page}/`;
  return absoluteUrl(pagePath, base);
}

function appendQuery(url, key, value) {
  const joiner = url.indexOf("?") >= 0 ? "&" : "?";
  return `${url}${joiner}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

function normalizePath(path) {
  if (!path) return "/";
  if (/^https?:\/\//i.test(path)) return path;
  return `/${String(path).replace(/^\/+/, "")}`;
}

function getBaseUrl(params = {}) {
  let baseUrl = String(params.baseUrl || "https://supjav.com").trim();
  if (!/^https?:\/\//i.test(baseUrl)) {
    baseUrl = `https://${baseUrl.replace(/^\/+/, "")}`;
  }
  return trimTrailingSlash(baseUrl);
}

function defaultHeaders(referer, params = {}) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
    "Referer": referer,
  };
  if (params.cookie) headers.Cookie = params.cookie;
  return headers;
}

function absoluteUrl(value, base) {
  if (!value) return "";
  const cleaned = String(value).trim().replace(/\\\//g, "/");
  try {
    return new URL(cleaned, base).toString();
  } catch (_) {
    return cleaned;
  }
}

function isLikelyDetailLink(url, pageUrl) {
  if (!url || /^(?:javascript|mailto):/i.test(url)) return false;
  let parsed;
  let base;
  try {
    parsed = new URL(url, pageUrl);
    base = new URL(pageUrl);
  } catch (_) {
    return false;
  }
  if (parsed.host !== base.host) return false;
  const path = parsed.pathname || "/";
  if (path === "/" || /^\/page\/\d+\/?$/i.test(path)) return false;
  if (/\.(?:jpg|jpeg|png|gif|webp|svg|mp4|m3u8|zip|rar|pdf)(?:$|\?)/i.test(path)) return false;
  if (/^\/(?:category|tag|tags|actor|actress|maker|series|genre|author|search|contact|privacy|dmca)(?:\/|$)/i.test(path)) return false;
  return true;
}

function pathAndQuery(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch (_) {
    return url;
  }
}

function titleFromUrl(url) {
  try {
    const parsed = new URL(url);
    const slug = parsed.pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(slug).replace(/[-_]+/g, " ").trim();
  } catch (_) {
    return "";
  }
}

function compactObject(object) {
  const result = {};
  for (const key in object) {
    const value = object[key];
    if (value === "" || value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    result[key] = value;
  }
  return result;
}

function isChallengeHtml(html) {
  const text = String(html || "");
  return /cf-mitigated["']?\s*[:=]\s*["']?challenge/i.test(text)
    || /Just a moment\.\.\./i.test(text)
    || /Enable JavaScript and cookies to continue/i.test(text)
    || /cdn-cgi\/challenge-platform/i.test(text)
    || /checking your browser/i.test(text);
}

function describeResource(url) {
  if (/\.m3u8(?:\?|$)/i.test(url)) return "HLS | public page source";
  if (/\.mp4(?:\?|$)/i.test(url)) return "MP4 | public page source";
  return "public page source";
}

function cleanText(value) {
  return decodeHtmlEntities(String(value || ""))
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/");
}

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

var __supjavTest = {
  parseListHtml,
  parseDetailHtml,
  extractVideoUrl,
  extractEmbedUrl,
  isChallengeHtml,
  buildPagedUrl,
  buildSearchUrl,
};
