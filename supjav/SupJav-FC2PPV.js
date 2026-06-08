WidgetMetadata = {
  id: "supjav_fc2ppv",
  title: "SupJav FC2PPV",
  description: "SupJav 中文站 FC2PPV 标签页，支持翻页、搜索和相关推荐。",
  author: "akafive",
  site: "https://supjav.com/zh/tag/fc2ppv",
  version: "1.0.1",
  requiredVersion: "0.0.2",
  detailCacheDuration: 60,
  modules: [
    {
      title: "搜索",
      description: "搜索 SupJav",
      requiresWebView: true,
      functionName: "search",
      cacheDuration: 3600,
      params: [
        {
          name: "keyword",
          title: "关键词",
          type: "input",
          description: "番号或关键词",
          placeholders: [
            { title: "FC2PPV", value: "fc2ppv" },
            { title: "番号", value: "FC2PPV-" },
          ],
        },
        cookieParam(),
        { name: "from", title: "页码", type: "page", description: "页码", value: "1" },
      ],
    },
    {
      title: "FC2PPV",
      description: "SupJav FC2PPV 标签列表",
      requiresWebView: true,
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "url",
          title: "列表地址",
          type: "constant",
          description: "列表地址",
          value: "https://supjav.com/zh/tag/fc2ppv",
        },
        cookieParam(),
        { name: "from", title: "页码", type: "page", description: "页码", value: "1" },
      ],
    },
  ],
};

const SUPJAV_BASE = "https://supjav.com";
const SUPJAV_HOME = "https://supjav.com/zh/";
const FC2PPV_URL = "https://supjav.com/zh/tag/fc2ppv";
const COOKIE_STORAGE_KEY = "supjav.fc2ppv.cookie";
const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
};

function cookieParam() {
  return {
    name: "cookie",
    title: "Cookie（可选）",
    type: "input",
    description: "浏览器通过 SupJav 验证后复制 Cookie，常见包含 cf_clearance",
    value: "",
  };
}

async function search(params = {}) {
  const keyword = String(params.keyword || "").trim();
  if (!keyword) return [];

  const cookie = rememberCookie(params.cookie);
  const htmlContent = await requestHtml(buildSearchUrl(encodeURIComponent(keyword), params.from), SUPJAV_HOME, cookie);
  return parseListHtml(htmlContent);
}

async function loadPage(params = {}) {
  const cookie = rememberCookie(params.cookie);
  const targetUrl = params.genreId || params.peopleId || params.url || FC2PPV_URL;
  const htmlContent = await requestHtml(buildListUrl(targetUrl, params.from), SUPJAV_HOME, cookie);
  return parseListHtml(htmlContent);
}

async function loadDetail(link) {
  if (!link) {
    throw new Error("详情页地址不能为空");
  }

  const pageUrl = absoluteUrl(link, SUPJAV_BASE);
  const cookie = getStoredCookie();
  const htmlContent = await requestHtml(pageUrl, SUPJAV_HOME, cookie);
  const $ = Widget.html.load(htmlContent);

  const title = cleanText(
    $('meta[property="og:title"]').attr("content") ||
      $('meta[name="og:title"]').attr("content") ||
      $("h1.entry-title, h1, .entry-title").first().text()
  );
  const cover = absoluteUrl(
    $('meta[property="og:image"]').attr("content") ||
      $('meta[name="og:image"]').attr("content") ||
      $(".post-meta img, .post-content img, article img, img").first().attr("src"),
    pageUrl
  );
  const description = cleanText(
    $(".post-content p")
      .filter(function () {
        return !$(this).find("img, iframe, video, script, style").length;
      })
      .first()
      .text() ||
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content")
  );

  const iframeUrl = pickPlayerIframeUrl($, htmlContent, pageUrl);
  let videoUrl = absoluteUrl(extractVideoUrl(htmlContent), pageUrl);
  let referer = pageUrl;

  if (!videoUrl && iframeUrl) {
    const iframeHtml = await requestHtml(iframeUrl, pageUrl, cookie);
    videoUrl = absoluteUrl(extractVideoUrl(iframeHtml), iframeUrl);
    referer = iframeUrl;
  }

  const stills = collectDetailImages($, pageUrl);
  if (!stills.length && cover) stills.push(cover);

  return cleanObject({
    id: pageUrl,
    type: "url",
    title: title || pageUrl,
    videoUrl,
    posterPath: cover || stills[0],
    backdropPath: cover || stills[0],
    backdropPaths: stills,
    description,
    genreItems: parseGenres($),
    relatedItems: parseRelatedItems($, pageUrl),
    mediaType: "movie",
    playerType: "system",
    link: pageUrl,
    customHeaders: videoUrl ? {
      "User-Agent": DEFAULT_HEADERS["User-Agent"],
      Referer: referer,
      Origin: originOf(referer),
    } : undefined,
  });
}

async function requestHtml(url, referer, cookie) {
  const headers = {
    ...DEFAULT_HEADERS,
    Referer: referer || SUPJAV_HOME,
  };
  if (cookie) headers.Cookie = cookie;

  const response = await Widget.http.get(url, { headers });
  if (!response || !response.data || typeof response.data !== "string") {
    throw new Error("无法获取有效的HTML内容");
  }
  if (isChallengeHtml(response.data)) {
    throw new Error("站点返回验证页，无法解析。请先在浏览器打开 supjav.com 通过验证，再把 Cookie 填到模块参数里；如果 Cookie 仍失效，说明站点验证无法由 Widget.http 复用。");
  }
  return response.data;
}

function parseListHtml(htmlContent) {
  const $ = Widget.html.load(htmlContent);
  const items = [];
  const seen = {};

  $(".posts.clearfix > .post, .posts > .post").each((_, element) => {
    const item = parsePostCard($, $(element));
    if (!item || seen[item.link]) return;
    seen[item.link] = true;
    items.push(item);
  });

  return items;
}

function parseRelatedItems($, currentUrl) {
  const items = [];
  const seen = {};
  seen[currentUrl] = true;

  $(".posts.clearfix > .post, .posts > .post").each((_, element) => {
    const item = parsePostCard($, $(element));
    if (!item || seen[item.link]) return;
    seen[item.link] = true;
    items.push(item);
  });

  return items;
}

function parsePostCard($, element) {
  const $item = element;
  const titleElement = $item.find("h3 > a[rel='bookmark'][itemprop='url'], h3 a[rel='bookmark'], h3 a").first();
  const coverElement = $item.find("a.img[title], a.img").first();
  const imageElement = coverElement.find("img").first().length ? coverElement.find("img").first() : $item.find("img").first();
  const link = absoluteUrl(titleElement.attr("href") || coverElement.attr("href"), SUPJAV_BASE);

  if (!isSupjavVideoUrl(link)) return null;

  const title = cleanText(titleElement.text() || coverElement.attr("title") || imageElement.attr("alt"));
  if (!title) return null;

  const cover = absoluteUrl(
    imageElement.attr("data-original") ||
      imageElement.attr("data-src") ||
      imageElement.attr("data-lazy-src") ||
      imageElement.attr("src"),
    link
  );
  const releaseDate = cleanText(
    $item.find(".date, time, .post-date").first().attr("datetime") ||
      $item.find(".date, time, .post-date").first().text()
  );

  return cleanObject({
    id: link,
    type: "url",
    title,
    posterPath: cover,
    backdropPath: cover,
    link,
    mediaType: "movie",
    releaseDate,
    playerType: "system",
  });
}

function parseGenres($) {
  const genres = [];
  const seen = {};

  $('a[rel="tag"], .tags a, a[href*="/tag/"]').each((_, element) => {
    const $a = $(element);
    const title = cleanText($a.text());
    const href = absoluteUrl($a.attr("href"), SUPJAV_BASE);
    if (!title || !href || seen[href]) return;
    seen[href] = true;
    genres.push({ id: href, title });
  });

  return genres;
}

function collectDetailImages($, pageUrl) {
  const images = [];
  const seen = {};

  collectBackgroundImages($, $("#player-wrap, .player-wrap"), images, seen, pageUrl);
  collectImagesInto($, $(".post-meta, .post-content"), images, seen, pageUrl);

  return images;
}

function collectImagesInto($, container, images, seen, pageUrl) {
  container.find("img").each((_, element) => {
    const $img = $(element);
    appendImage(
      absoluteUrl(
        $img.attr("data-original") ||
          $img.attr("data-src") ||
          $img.attr("data-lazy-src") ||
          $img.attr("src"),
        pageUrl
      ),
      images,
      seen
    );
  });
}

function collectBackgroundImages($, container, images, seen, pageUrl) {
  container.each((_, element) => {
    appendStyleImage($(element).attr("style"), images, seen, pageUrl);
  });
  container.find("[style]").each((_, element) => {
    appendStyleImage($(element).attr("style"), images, seen, pageUrl);
  });
}

function appendStyleImage(style, images, seen, pageUrl) {
  const match = String(style || "").match(/url\((['"]?)(.*?)\1\)/i);
  if (!match) return;
  appendImage(absoluteUrl(match[2], pageUrl), images, seen);
}

function appendImage(url, images, seen) {
  if (!url || seen[url] || isIgnoredImage(url)) return;
  seen[url] = true;
  images.push(url);
}

function rememberCookie(raw) {
  const cookie = normalizeCookie(raw);
  if (cookie && Widget.storage && Widget.storage.set) {
    Widget.storage.set(COOKIE_STORAGE_KEY, cookie);
  }
  return cookie || getStoredCookie();
}

function getStoredCookie() {
  if (!Widget.storage || !Widget.storage.get) return "";
  return normalizeCookie(Widget.storage.get(COOKIE_STORAGE_KEY));
}

function normalizeCookie(raw) {
  if (!raw) return "";
  return String(raw).trim().replace(/^cookie\s*:\s*/i, "").trim();
}

function buildSearchUrl(encodedKeyword, from) {
  const page = Number(from || 1);
  if (page > 1) {
    return `${SUPJAV_HOME}page/${page}/?s=${encodedKeyword}`;
  }
  return `${SUPJAV_HOME}?s=${encodedKeyword}`;
}

function buildListUrl(url, from) {
  const page = Number(from || 1);
  const absolute = absoluteUrl(url || FC2PPV_URL, SUPJAV_HOME);
  if (!page || page <= 1) return absolute;
  if (absolute.includes("?")) {
    return `${absolute}&paged=${page}`;
  }
  return `${absolute.replace(/\/+$/, "")}/page/${page}/`;
}

function extractVideoUrl(htmlContent) {
  const decoded = decodeHtmlEntities(String(htmlContent || ""));
  const patterns = [
    /<source\b[^>]+src=["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i,
    /(?:videoUrl|video_url|hlsUrl|source|src|file)\s*[:=]\s*["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i,
    /https?:\\?\/\\?\/[^"'<>\\\s]+?\.(?:mp4|m3u8)[^"'<>\\\s]*/i,
  ];

  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (match) return (match[1] || match[0]).replace(/\\\//g, "/");
  }
  return "";
}

function extractIframeUrl(htmlContent) {
  const match = String(htmlContent || "").match(/<iframe\b[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : "";
}

function pickPlayerIframeUrl($, htmlContent, pageUrl) {
  const candidates = [];
  $("iframe[src]").each((_, element) => {
    candidates.push($(element).attr("src"));
  });
  candidates.push(extractIframeUrl(htmlContent));

  for (const candidate of candidates) {
    const iframeUrl = absoluteUrl(candidate, pageUrl);
    if (isPlayerIframeUrl(iframeUrl)) return iframeUrl;
  }

  return "";
}

function isPlayerIframeUrl(url) {
  if (!url || /^javascript:/i.test(url)) return false;
  const lowered = String(url).toLowerCase();
  if (
    lowered.includes("/ad?") ||
    lowered.includes("smartpop") ||
    lowered.includes("spotid=") ||
    lowered.includes("mnaspm.com") ||
    lowered.includes("eix304.com") ||
    lowered.includes("doubleclick") ||
    lowered.includes("googlesyndication") ||
    lowered.includes("adsterra") ||
    lowered.includes("popads")
  ) {
    return false;
  }
  return (
    lowered.includes("embed") ||
    lowered.includes("player") ||
    lowered.includes("stream") ||
    lowered.includes("m3u8") ||
    lowered.includes("mp4") ||
    lowered.includes("supjav.com")
  );
}

function isSupjavVideoUrl(url) {
  if (!url) return false;
  const absolute = absoluteUrl(url, SUPJAV_BASE);
  if (!/^https?:\/\/(?:www\.)?supjav\.com(?:\/|$)/i.test(absolute)) return false;
  const path = pathOf(absolute);
  if (!/^\/zh\/[^/?#]+\/?$/i.test(path)) return false;
  return !/^\/zh\/(?:page|category|tag|actor|actress|maker|series|genre|author)\//i.test(path);
}

function absoluteUrl(value, base) {
  if (!value) return "";
  const cleaned = String(value).trim().replace(/\\\//g, "/");
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  if (/^\/\//.test(cleaned)) return `https:${cleaned}`;
  const origin = originOf(base || SUPJAV_BASE);
  if (cleaned.charAt(0) === "/") return `${origin}${cleaned}`;
  const baseNoQuery = String(base || SUPJAV_HOME).split("#")[0].split("?")[0];
  const dir = /\/$/.test(baseNoQuery) ? baseNoQuery : baseNoQuery.replace(/\/[^/]*$/, "/");
  return `${dir}${cleaned}`;
}

function originOf(url) {
  const match = String(url || "").match(/^(https?:\/\/[^/]+)/i);
  return match ? match[1] : SUPJAV_BASE;
}

function pathOf(url) {
  return String(url || "")
    .replace(/^https?:\/\/[^/]+/i, "")
    .split("#")[0]
    .split("?")[0] || "/";
}

function cleanObject(object) {
  const result = {};
  for (const key in object) {
    const value = object[key];
    if (value === "" || value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    result[key] = value;
  }
  return result;
}

function isChallengeHtml(htmlContent) {
  const text = String(htmlContent || "");
  return /cf-mitigated["']?\s*[:=]\s*["']?challenge/i.test(text) ||
    /Just a moment\.\.\./i.test(text) ||
    /Enable JavaScript and cookies to continue/i.test(text) ||
    /cdn-cgi\/challenge-platform/i.test(text) ||
    /checking your browser/i.test(text);
}

function isIgnoredImage(url) {
  const lowered = String(url || "").toLowerCase();
  return lowered.includes("logo") ||
    lowered.includes("avatar") ||
    lowered.includes("icon") ||
    lowered.includes("ads") ||
    lowered.includes("banner");
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
