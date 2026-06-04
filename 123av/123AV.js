WidgetMetadata = {
  id: "forward.123av",
  title: "123AV",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "123AV 网页抓取插件，支持列表、分类、搜索、详情、播放地址和通用弹幕。",
  author: "Forward",
  site: "https://123av.com/zh/dm9",
  detailCacheDuration: 300,
  globalParams: [
    {
      name: "baseUrl",
      title: "站点地址",
      type: "input",
      value: "https://123av.com",
      placeholders: [{ title: "默认", value: "https://123av.com" }],
    },
    {
      name: "languagePath",
      title: "语言路径",
      type: "enumeration",
      value: "zh",
      enumOptions: [
        { title: "中文", value: "zh" },
        { title: "English", value: "en" },
        { title: "日本語", value: "ja" },
        { title: "한국어", value: "ko" },
      ],
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
      id: "loadList",
      title: "影片列表",
      functionName: "loadList",
      cacheDuration: 1800,
      requiresWebView: false,
      params: [
        {
          name: "category",
          title: "分类",
          type: "enumeration",
          value: "new-release",
          enumOptions: [
            { title: "首页", value: "home" },
            { title: "最新", value: "new-release" },
            { title: "热门", value: "trending" },
            { title: "无码流出", value: "uncensored-leak" },
            { title: "中文字幕", value: "chinese-subtitle" },
          ],
        },
        { name: "genreId", title: "标签", type: "input" },
        { name: "peopleId", title: "演员", type: "input" },
        { name: "page", title: "页码", type: "page" },
      ],
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
      {
        name: "keyword",
        title: "关键词",
        type: "input",
        placeholders: [{ title: "番号 / 标题 / 演员", value: "dm9" }],
      },
      { name: "page", title: "页码", type: "page" },
    ],
  },
};

const DEFAULT_BASE_URL = "https://123av.com";
const DEFAULT_LANGUAGE_PATH = "zh";
const DEFAULT_DANMU_SERVER = "https://api.dandanplay.net";

async function loadList(params = {}) {
  try {
    const baseUrl = normalizeBaseUrl(params.baseUrl);
    const url = buildListUrl(params, baseUrl, normalizeLanguagePath(params.languagePath));
    const html = await requestHtml(url);
    return parseVideoList(html, baseUrl);
  } catch (error) {
    console.error("[123av loadList] 失败:", error.message || error);
    throw error;
  }
}

async function search(params = {}) {
  try {
    const keyword = cleanText(params.keyword);
    if (!keyword) return [];
    const baseUrl = normalizeBaseUrl(params.baseUrl);
    const languagePath = normalizeLanguagePath(params.languagePath);
    const page = positiveInt(params.page, 1);
    const res = await Widget.http.get(`${baseUrl}/${languagePath}/search`, {
      headers: requestHeaders(baseUrl),
      params: { keyword, page },
    });
    return parseVideoList(res.data || "", baseUrl);
  } catch (error) {
    console.error("[123av search] 失败:", error.message || error);
    throw error;
  }
}

async function loadDetail(link) {
  try {
    const detailPath = parseDetailLink(link);
    if (!detailPath) return null;
    const baseUrl = detailPath.indexOf("http") === 0 ? originFromUrl(detailPath) : DEFAULT_BASE_URL;
    const detailUrl = detailPath.indexOf("http") === 0 ? detailPath : `${DEFAULT_BASE_URL}${detailPath}`;
    const html = await requestHtml(detailUrl);
    return parseDetail(html, detailPath, baseUrl);
  } catch (error) {
    console.error("[123av loadDetail] 失败:", error.message || error);
    throw error;
  }
}

async function searchDanmu(params = {}) {
  const keyword = cleanText(params.seriesName || params.title);
  if (!keyword) return { animes: [] };
  const server = normalizeBaseUrl(params.server || DEFAULT_DANMU_SERVER);
  const res = await Widget.http.get(`${server}/api/v2/search/anime`, {
    params: { keyword },
  });
  const animes = (((res.data || {}).animes) || []).map((anime) => ({
    animeId: anime.bangumiId || anime.animeId,
    animeTitle: anime.animeTitle || anime.title || keyword,
    type: anime.type || params.type || "ova",
  })).filter((anime) => anime.animeId);
  return { animes };
}

async function getDetailById(params = {}) {
  if (!params.animeId) return [];
  const server = normalizeBaseUrl(params.server || DEFAULT_DANMU_SERVER);
  const res = await Widget.http.get(`${server}/api/v2/bangumi/${encodeURIComponent(params.animeId)}`);
  const bangumi = (res.data || {}).bangumi || {};
  const episodes = bangumi.episodes || res.data.episodes || [];
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

function buildListUrl(params, baseUrl, languagePath) {
  const page = positiveInt(params.page, 1);
  let path;
  if (params.peopleId) {
    path = `/${languagePath}/dm9/actors/${encodeURIComponent(String(params.peopleId))}`;
  } else if (params.genreId) {
    path = `/${languagePath}/dm9/tags/${encodeURIComponent(String(params.genreId))}`;
  } else {
    const category = params.category || "new-release";
    path = category === "home" ? `/${languagePath}/dm9` : `/${languagePath}/dm9/${encodeURIComponent(category)}`;
  }
  if (page > 1) path += `/${page}`;
  return `${baseUrl}${path}`;
}

async function requestHtml(url) {
  const res = await Widget.http.get(url, { headers: requestHeaders(url) });
  return String(res.data || "");
}

function parseVideoList(html, baseUrl) {
  const $ = Widget.html.load(html);
  const items = [];
  const seen = {};
  $("a[href*='/v/']").each((_, element) => {
    const $link = $(element);
    const href = $link.attr("href");
    const path = pathFromHref(href);
    const id = extractVideoId(path);
    if (!id || seen[path]) return;
    seen[path] = true;
    const poster = firstAttr($link.find("img").first(), ["data-src", "data-original", "data-lazy-src", "src"]);
    const title = cleanText(
      $link.find(".title").first().text()
      || $link.find("h3").first().text()
      || $link.find("h2").first().text()
      || $link.find("img").first().attr("alt")
      || $link.text()
      || id.toUpperCase()
    );
    if (!title && !poster) return;
    const durationText = cleanText($link.find(".duration").first().text() || extractDurationText($link.text()));
    items.push({
      id,
      type: "url",
      title: title || id.toUpperCase(),
      posterPath: absoluteUrl(poster, baseUrl),
      durationText,
      link: `detail:${absoluteUrl(path, baseUrl)}`,
      playerType: "system",
    });
  });
  return items;
}

function parseDetail(html, detailPath, baseUrl) {
  const $ = Widget.html.load(html);
  const ld = readJsonLd($);
  const id = extractVideoId(detailPath) || detailPath;
  const title = cleanText(
    ld.name
    || $("h1").first().text()
    || $("meta[property='og:title']").first().attr("content")
    || id.toUpperCase()
  );
  const poster = absoluteUrl(firstValue(ld.thumbnailUrl) || $("video").first().attr("poster") || firstAttr($("img").first(), ["data-src", "src"]), baseUrl);
  const videoUrl = absoluteUrl(
    ld.contentUrl
    || ld.embedUrl
    || $("video source").first().attr("src")
    || $("video").first().attr("src")
    || $("[data-src]").first().attr("data-src")
    || extractPlayableUrl(html),
    baseUrl
  );
  const backdropPaths = uniqueStrings(
    []
      .concat(arrayValue(ld.thumbnailUrl))
      .concat($("img").map((_, img) => absoluteUrl(firstAttr($(img), ["data-src", "data-original", "src"]), baseUrl)).get())
  ).filter((url) => url && url !== poster);
  if (poster && backdropPaths.indexOf(poster) < 0) backdropPaths.unshift(poster);

  return {
    id,
    type: "url",
    title,
    posterPath: poster,
    backdropPath: backdropPaths[0] || poster,
    backdropPaths,
    videoUrl,
    previewUrl: videoUrl,
    duration: durationToSeconds(ld.duration),
    durationText: secondsToText(durationToSeconds(ld.duration)) || extractDurationText(html),
    releaseDate: cleanText(ld.uploadDate || ld.datePublished),
    description: cleanText(ld.description || $("meta[name='description']").first().attr("content") || $(".description").first().text()),
    genreItems: parseTaxonomy($, "tags"),
    peoples: parsePeople($),
    relatedItems: parseVideoList(html, baseUrl).filter((item) => item.id !== id),
    link: `detail:${detailPath.indexOf("http") === 0 ? detailPath : absoluteUrl(detailPath, baseUrl)}`,
    playerType: "system",
  };
}

function readJsonLd($) {
  const blocks = $("script[type='application/ld+json']").map((_, script) => $(script).text()).get();
  for (let i = 0; i < blocks.length; i += 1) {
    const text = cleanText(blocks[i]);
    if (!text) continue;
    try {
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      for (let j = 0; j < list.length; j += 1) {
        const item = list[j];
        if (item && (item["@type"] === "VideoObject" || item.contentUrl || item.embedUrl)) return item;
      }
    } catch (_) {}
  }
  return {};
}

function parseTaxonomy($, segment) {
  const items = [];
  const seen = {};
  $(`a[href*='/${segment}/'], a[href*='${segment}/']`).each((_, element) => {
    const $link = $(element);
    const id = lastPathPart($link.attr("href"));
    const title = cleanText($link.text());
    if (!id || !title || seen[id]) return;
    seen[id] = true;
    items.push({ id, title });
  });
  return items;
}

function parsePeople($) {
  return parseTaxonomy($, "actors").map((item) => ({
    id: item.id,
    title: item.title,
    role: "演员",
  }));
}

function parseDetailLink(link) {
  const value = String(link || "");
  const raw = value.indexOf("detail:") === 0 ? value.slice("detail:".length) : value;
  if (!raw) return "";
  return raw.indexOf("http") === 0 ? raw : pathFromHref(raw);
}

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function normalizeLanguagePath(languagePath) {
  return cleanText(languagePath || DEFAULT_LANGUAGE_PATH).replace(/^\/+|\/+$/g, "") || DEFAULT_LANGUAGE_PATH;
}

function requestHeaders(referer) {
  return {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    Referer: referer || DEFAULT_BASE_URL,
  };
}

function pathFromHref(href) {
  const value = String(href || "").trim();
  if (!value) return "";
  const noHash = value.split("#")[0].split("?")[0];
  const path = noHash.replace(/^https?:\/\/[^/]+/i, "");
  return path.indexOf("/") === 0 ? path : `/${path}`;
}

function originFromUrl(url) {
  const match = String(url || "").match(/^(https?:\/\/[^/]+)/i);
  return match ? match[1].replace(/\/+$/, "") : DEFAULT_BASE_URL;
}

function extractVideoId(href) {
  const parts = pathFromHref(href).split("/").filter(Boolean);
  const index = parts.indexOf("v");
  return index >= 0 && parts[index + 1] ? decodeURIComponent(parts[index + 1]).toLowerCase() : "";
}

function lastPathPart(href) {
  const parts = pathFromHref(href).split("/").filter(Boolean);
  return parts.length ? decodeURIComponent(parts[parts.length - 1]) : "";
}

function absoluteUrl(value, baseUrl) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.indexOf("//") === 0) return `https:${url}`;
  const base = normalizeBaseUrl(baseUrl);
  return url.indexOf("/") === 0 ? `${base}${url}` : `${base}/${url}`;
}

function firstAttr($node, names) {
  for (let i = 0; i < names.length; i += 1) {
    const value = $node.attr(names[i]);
    if (value) return value;
  }
  return "";
}

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function arrayValue(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function uniqueStrings(values) {
  const seen = {};
  const out = [];
  for (let i = 0; i < values.length; i += 1) {
    const value = cleanText(values[i]);
    if (!value || seen[value]) continue;
    seen[value] = true;
    out.push(value);
  }
  return out;
}

function cleanText(value) {
  return String(value || "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function positiveInt(value, fallback) {
  const number = parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function extractDurationText(text) {
  const match = String(text || "").match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/);
  return match ? match[0] : "";
}

function durationToSeconds(value) {
  const text = String(value || "");
  if (!text) return 0;
  const iso = text.match(/P(?:T)?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (iso) return positiveInt(iso[1], 0) * 3600 + positiveInt(iso[2], 0) * 60 + positiveInt(iso[3], 0);
  const parts = text.split(":").map((part) => parseInt(part, 10)).filter((part) => Number.isFinite(part));
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function secondsToText(seconds) {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => (n < 10 ? `0${n}` : String(n));
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function extractPlayableUrl(html) {
  const text = String(html || "");
  const patterns = [
    /https?:\/\/[^"'\\\s]+\.m3u8[^"'\\\s]*/i,
    /https?:\/\/[^"'\\\s]+\.mp4[^"'\\\s]*/i,
    /["'](?:file|url|src)["']\s*:\s*["']([^"']+)["']/i,
  ];
  for (let i = 0; i < patterns.length; i += 1) {
    const match = text.match(patterns[i]);
    if (match) return match[1] || match[0];
  }
  return "";
}
