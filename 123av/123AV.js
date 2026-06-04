WidgetMetadata = {
  id: "123av_int",
  title: "123AV",
  description: "参考 Jable 写法重写：列表、搜索、详情解析、播放资源和弹幕",
  author: "Forward",
  site: "https://123av.com/zh/dm9",
  version: "1.1.0",
  requiredVersion: "0.0.2",
  detailCacheDuration: 60,
  globalParams: [
    {
      name: "baseUrl",
      title: "站点地址",
      type: "input",
      value: "https://123av.com",
      placeholders: [{ title: "123AV", value: "https://123av.com" }],
    },
    {
      name: "server",
      title: "弹幕服务器",
      type: "input",
      value: "https://api.dandanplay.net",
      placeholders: [{ title: "dandanplay", value: "https://api.dandanplay.net" }],
    },
  ],
  modules: [
    {
      id: "latest",
      title: "最新",
      description: "最新影片",
      requiresWebView: false,
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "url",
          title: "列表地址",
          type: "constant",
          value: "https://123av.com/zh/dm9/new-release/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
        },
        sortParam(),
        pageFromParam(),
      ],
    },
    {
      id: "hot",
      title: "热门",
      description: "热门影片",
      requiresWebView: false,
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "url",
          title: "列表地址",
          type: "constant",
          value: "https://123av.com/zh/dm9/trending/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
        },
        sortParam(),
        pageFromParam(),
      ],
    },
    {
      id: "category",
      title: "分类/路径",
      description: "按路径浏览",
      requiresWebView: false,
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "url",
          title: "列表地址",
          type: "input",
          value: "https://123av.com/zh/dm9/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
          description: "可填 /zh/dm9/tags/... 或完整列表 URL",
        },
        sortParam(),
        pageFromParam(),
      ],
    },
    {
      id: "detail",
      title: "详情解析",
      description: "输入详情页链接解析播放地址",
      requiresWebView: false,
      functionName: "detail",
      cacheDuration: 3600,
      params: [{ name: "link", title: "详情页链接", type: "input", value: "" }],
    },
    {
      id: "loadResource",
      title: "加载资源",
      functionName: "loadResource",
      type: "stream",
      cacheDuration: 3600,
      params: [],
    },
    {
      id: "searchDanmu",
      title: "搜索弹幕",
      functionName: "searchDanmu",
      type: "danmu",
      cacheDuration: 3600,
      params: [],
    },
    {
      id: "getDetail",
      title: "弹幕剧集",
      functionName: "getDetailById",
      type: "danmu",
      cacheDuration: 3600,
      params: [],
    },
    {
      id: "getComments",
      title: "弹幕内容",
      functionName: "getCommentsById",
      type: "danmu",
      cacheDuration: 3600,
      params: [],
    },
  ],
  search: {
    title: "搜索",
    functionName: "search",
    params: [
      { name: "keyword", title: "关键词", type: "input", description: "番号 / 标题 / 演员" },
      sortParam(),
      pageFromParam(),
    ],
  },
};

const DEFAULT_BASE_URL = "https://123av.com";
const DEFAULT_DANMU_SERVER = "https://api.dandanplay.net";

function sortParam() {
  return {
    name: "sort_by",
    title: "排序",
    type: "enumeration",
    value: "post_date",
    enumOptions: [
      { title: "最近更新", value: "post_date" },
      { title: "最多观看", value: "video_viewed" },
      { title: "最多收藏", value: "most_favourited" },
    ],
  };
}

function pageFromParam() {
  return { name: "from", title: "页码", type: "page", value: "1" };
}

async function search(params = {}) {
  const keyword = encodeURIComponent(cleanText(params.keyword || params.query || ""));
  if (!keyword) throw new Error("请输入搜索关键词");
  const baseUrl = getBaseUrl(params);
  let url = `${baseUrl}/zh/search/${keyword}/?mode=async&function=get_block&block_id=list_videos_videos_list_search_result&q=${keyword}`;
  if (params.sort_by) url += `&sort_by=${encodeURIComponent(params.sort_by)}`;
  if (params.from) url += `&from=${encodeURIComponent(params.from)}`;
  return loadPage(Object.assign({}, params, { url }));
}

async function loadPage(params = {}) {
  const sections = await loadPageSections(params);
  return sections.flatMap((section) => section.childItems || []);
}

async function loadPageSections(params = {}) {
  let url = absoluteUrl(params.url || "", getBaseUrl(params));
  if (!url) throw new Error("地址不能为空");
  if (params.sort_by && url.indexOf("sort_by=") < 0) url = appendQuery(url, "sort_by", params.sort_by);
  if (params.from && url.indexOf("from=") < 0) url = appendQuery(url, "from", params.from);

  const response = await Widget.http.get(url, { headers: defaultHeaders(url, params) });
  if (!response || typeof response.data !== "string") throw new Error("无法获取有效的HTML内容");
  if (isChallengeHtml(response.data)) throw new Error("站点返回验证页，无法解析");
  return parseHtml(response.data, url);
}

function parseHtml(htmlContent, pageUrl) {
  const $ = Widget.html.load(htmlContent);
  const sections = [];
  const items = [];
  const seen = {};
  const cardSelector = ".video-img-box, .video-card, article, .item";
  const cards = $(cardSelector).toArray ? $(cardSelector).toArray() : $(cardSelector).get();

  for (const card of cards) {
    const $card = $(card);
    const $link = findDetailLink($, $card, pageUrl);
    const link = absoluteUrl($link.attr("href"), pageUrl);
    if (!isDetailLink(link) || seen[link]) continue;

    const $img = $card.find("img").first();
    const title = cleanText(
      $link.attr("title")
      || $link.text()
      || $card.find(".title").first().text()
      || $img.attr("alt")
      || titleFromUrl(link)
    );
    if (!title) continue;

    const poster = absoluteUrl(imageSource($img), pageUrl);
    const preview = absoluteUrl($img.attr("data-preview") || $card.attr("data-preview"), pageUrl);
    const duration = cleanText($card.find(".duration, .label, .time").first().text());
    seen[link] = true;
    items.push(compactObject({
      id: link,
      type: "url",
      mediaType: "movie",
      title,
      posterPath: poster,
      backdropPath: poster,
      previewUrl: preview,
      durationText: duration,
      releaseDate: duration,
      link,
      playerType: "system",
    }));
  }

  if (items.length === 0) {
    const anchors = $("a[href]").toArray ? $("a[href]").toArray() : $("a[href]").get();
    for (const anchor of anchors) {
      const $anchor = $(anchor);
      const link = absoluteUrl($anchor.attr("href"), pageUrl);
      if (!isDetailLink(link) || seen[link]) continue;
      const title = cleanText($anchor.attr("title") || $anchor.text() || titleFromUrl(link));
      if (!title) continue;
      seen[link] = true;
      items.push(compactObject({ id: link, type: "url", mediaType: "movie", title, link, playerType: "system" }));
    }
  }

  if (items.length > 0) sections.push({ title: "123AV", childItems: items });
  return sections;
}

async function detail(params = {}) {
  const link = params.link || params.id;
  if (!link) throw new Error("缺少详情页链接");
  return loadDetail(absoluteUrl(link, getBaseUrl(params)), params);
}

async function loadDetail(link, params = {}) {
  const url = normalizeDetailLink(link, getBaseUrl(params));
  if (!url) return null;
  const response = await Widget.http.get(url, { headers: defaultHeaders(url, params) });
  if (!response || typeof response.data !== "string") throw new Error("无法获取详情页");
  if (isChallengeHtml(response.data)) throw new Error("站点返回验证页，无法解析详情");
  return parseDetailHtml(response.data, url);
}

async function loadResource(params = {}) {
  const link = params.link || params.id;
  if (!link) throw new Error("缺少详情页链接");
  const info = await loadDetail(link, params);
  if (!info || !info.videoUrl) throw new Error("未在详情页找到公开 mp4/m3u8 播放地址");
  return [{
    name: info.title || "123AV",
    description: info.videoUrl.indexOf(".m3u8") >= 0 ? "HLS" : "MP4",
    url: info.videoUrl,
    headers: {
      Referer: info.link || link,
      "User-Agent": defaultUserAgent(),
    },
  }];
}

function parseDetailHtml(html, pageUrl) {
  const $ = Widget.html.load(html);
  const title = cleanText(
    $("meta[property='og:title']").first().attr("content")
    || $("h1, .title, .video-title").first().text()
    || titleFromUrl(pageUrl)
  );
  const poster = absoluteUrl($("meta[property='og:image']").first().attr("content") || imageSource($("img").first()), pageUrl);
  const videoUrl = absoluteUrl(extractVideoUrl(html), pageUrl);
  const description = cleanText($("meta[name='description']").first().attr("content"));
  const backdropPaths = uniqueStrings([poster].concat($("img").map((_, img) => absoluteUrl(imageSource($(img)), pageUrl)).get()));
  const relatedSections = parseHtml(html, pageUrl);
  const relatedItems = relatedSections.flatMap((section) => section.childItems || []).filter((item) => item.link !== pageUrl).slice(0, 12);

  return compactObject({
    id: pageUrl,
    type: "url",
    mediaType: "movie",
    title,
    description,
    posterPath: poster,
    backdropPath: poster || backdropPaths[0],
    backdropPaths: backdropPaths.length ? backdropPaths : undefined,
    videoUrl,
    previewUrl: videoUrl,
    genreItems: parseTaxonomy($, pageUrl, "tags"),
    peoples: parsePeople($, pageUrl),
    relatedItems: relatedItems.length ? relatedItems : undefined,
    link: pageUrl,
    playerType: "system",
    customHeaders: {
      Referer: pageUrl,
      Origin: originFromUrl(pageUrl),
      "User-Agent": defaultUserAgent(),
    },
  });
}

async function searchDanmu(params = {}) {
  const keyword = cleanText(params.seriesName || params.title);
  if (!keyword) return { animes: [] };
  const server = normalizeBaseUrl(params.server || DEFAULT_DANMU_SERVER);
  const res = await Widget.http.get(`${server}/api/v2/search/anime`, { params: { keyword } });
  const animes = (((res.data || {}).animes) || []).map((anime) => ({
    animeId: anime.bangumiId || anime.animeId,
    animeTitle: anime.animeTitle || anime.title || keyword,
    type: anime.type || params.type || "movie",
  })).filter((anime) => anime.animeId);
  return { animes };
}

async function getDetailById(params = {}) {
  if (!params.animeId) return [];
  const server = normalizeBaseUrl(params.server || DEFAULT_DANMU_SERVER);
  const res = await Widget.http.get(`${server}/api/v2/bangumi/${encodeURIComponent(params.animeId)}`);
  const bangumi = (res.data || {}).bangumi || {};
  const episodes = bangumi.episodes || (res.data || {}).episodes || [];
  return episodes.map((episode) => ({
    episodeId: episode.episodeId,
    episodeTitle: episode.episodeTitle || episode.title || `第${episode.episodeNumber || ""}集`,
  })).filter((episode) => episode.episodeId);
}

async function getCommentsById(params = {}) {
  if (!params.commentId) return { count: 0, comments: [] };
  const server = normalizeBaseUrl(params.server || DEFAULT_DANMU_SERVER);
  const res = await Widget.http.get(`${server}/api/v2/comment/${encodeURIComponent(params.commentId)}`, {
    params: { withRelated: "true", chConvert: 1 },
  });
  return res.data || { count: 0, comments: [] };
}

function findDetailLink($, $card, pageUrl) {
  const anchors = $card.find("a[href]").toArray ? $card.find("a[href]").toArray() : $card.find("a[href]").get();
  for (const anchor of anchors) {
    const $anchor = $(anchor);
    const link = absoluteUrl($anchor.attr("href"), pageUrl);
    if (isDetailLink(link)) return $anchor;
  }
  return $card.find("a[href]").first();
}

function imageSource($img) {
  return $img.attr("data-src") || $img.attr("data-original") || $img.attr("data-lazy-src") || $img.attr("src") || "";
}

function parseTaxonomy($, pageUrl, segment) {
  const seen = {};
  return $(`a[href*='/${segment}/']`).map((_, anchor) => {
    const $anchor = $(anchor);
    const path = pathAndQuery(absoluteUrl($anchor.attr("href"), pageUrl));
    const title = cleanText($anchor.text() || $anchor.attr("title"));
    if (!path || !title || seen[path]) return null;
    seen[path] = true;
    return { id: path, title };
  }).get().filter(Boolean);
}

function parsePeople($, pageUrl) {
  const seen = {};
  return $("a[href*='/actors/']").map((_, anchor) => {
    const $anchor = $(anchor);
    const path = pathAndQuery(absoluteUrl($anchor.attr("href"), pageUrl));
    const title = cleanText($anchor.text() || $anchor.attr("title"));
    if (!path || !title || seen[path]) return null;
    seen[path] = true;
    return { id: path, title, role: "演员" };
  }).get().filter(Boolean);
}

function extractVideoUrl(html) {
  const decoded = decodeHtmlEntities(String(html || ""));
  const patterns = [
    /var\s+hlsUrl\s*=\s*["']([^"']+)["']/i,
    /(?:hlsUrl|videoUrl|video_url|source|src|file)\s*[:=]\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i,
    /<source\b[^>]+src=["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i,
    /https?:\\?\/\\?\/[^"'<>\\\s]+?\.(?:m3u8|mp4)[^"'<>\\\s]*/i,
  ];
  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (match) return (match[1] || match[0]).replace(/\\\//g, "/");
  }
  return "";
}

function appendQuery(url, key, value) {
  const join = url.indexOf("?") >= 0 ? "&" : "?";
  return `${url}${join}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

function absoluteUrl(value, baseUrl) {
  const url = cleanText(value);
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.indexOf("//") === 0) return `https:${url}`;
  const base = normalizeBaseUrl(originFromUrl(baseUrl) || baseUrl || DEFAULT_BASE_URL);
  return url.indexOf("/") === 0 ? `${base}${url}` : `${base}/${url}`;
}

function normalizeDetailLink(link, baseUrl) {
  const value = cleanText(link);
  if (!value) return "";
  if (value.indexOf("detail:") === 0) return absoluteUrl(value.slice(7), baseUrl);
  return absoluteUrl(value, baseUrl);
}

function isDetailLink(link) {
  return /\/v\/[^/?#]+/i.test(String(link || ""));
}

function titleFromUrl(url) {
  const clean = String(url || "").split("?")[0].replace(/\/+$/, "");
  const part = clean.split("/").pop() || clean;
  return decodeURIComponent(part).replace(/-/g, " ").toUpperCase();
}

function getBaseUrl(params = {}) {
  return normalizeBaseUrl(params.baseUrl || DEFAULT_BASE_URL);
}

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function originFromUrl(url) {
  const match = String(url || "").match(/^(https?:\/\/[^/]+)/i);
  return match ? match[1] : DEFAULT_BASE_URL;
}

function pathAndQuery(url) {
  return String(url || "").replace(/^https?:\/\/[^/]+/i, "");
}

function defaultHeaders(referer, params = {}) {
  const headers = {
    "User-Agent": defaultUserAgent(),
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    Referer: referer || DEFAULT_BASE_URL,
  };
  if (params.cookie) headers.Cookie = params.cookie;
  return headers;
}

function defaultUserAgent() {
  return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
}

function isChallengeHtml(html) {
  const text = String(html || "").toLowerCase();
  return text.indexOf("cloudflare") >= 0 || text.indexOf("just a moment") >= 0 || text.indexOf("captcha") >= 0;
}

function cleanText(value) {
  return String(value || "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function uniqueStrings(values) {
  const seen = {};
  const out = [];
  for (const raw of values) {
    const value = cleanText(raw);
    if (!value || seen[value]) continue;
    seen[value] = true;
    out.push(value);
  }
  return out;
}

function compactObject(object) {
  const out = {};
  Object.keys(object || {}).forEach((key) => {
    const value = object[key];
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value) && value.length === 0) return;
    out[key] = value;
  });
  return out;
}
