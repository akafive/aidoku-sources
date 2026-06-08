WidgetMetadata = {
  id: "forward.supjav.fc2ppv",
  title: "SupJav FC2PPV",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  description: "抓取 SupJav 中文站 fc2ppv 标签列表，支持翻页、搜索和相关推荐。",
  author: "akafive",
  site: "https://supjav.com/zh/tag/fc2ppv",
  detailCacheDuration: 3600,
  globalParams: [
    {
      name: "cookie",
      title: "Cookie（可选）",
      type: "input",
      description: "浏览器通过 SupJav 验证后复制 Cookie，常见包含 cf_clearance",
      value: "",
    },
  ],
  modules: [
    {
      id: "loadList",
      title: "FC2PPV",
      functionName: "loadList",
      cacheDuration: 3600,
      requiresWebView: true,
      params: [
        {
          name: "page",
          title: "页码",
          type: "page",
        },
      ],
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
        placeholders: [
          { title: "FC2PPV", value: "fc2ppv" },
          { title: "番号", value: "FC2PPV-" },
        ],
      },
      {
        name: "page",
        title: "页码",
        type: "page",
      },
    ],
  },
};

var SUPJAV_BASE_URL = "https://supjav.com";
var SUPJAV_ZH_URL = SUPJAV_BASE_URL + "/zh";
var SUPJAV_TAG_URL = SUPJAV_ZH_URL + "/tag/fc2ppv";
var SUPJAV_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  Referer: SUPJAV_ZH_URL + "/",
};
var COOKIE_STORAGE_KEY = "supjav.fc2ppv.cookie";

async function loadList(params) {
  var page = normalizePage(params && params.page);
  var genreUrl = normalizeUrl(params && params.genreId);
  var url = genreUrl || buildListUrl(page);
  var cookie = rememberCookie(params && params.cookie);
  return fetchList(url, cookie);
}

async function search(params) {
  var keyword = params && params.keyword ? String(params.keyword).trim() : "";
  if (!keyword) {
    return [];
  }

  var page = normalizePage(params && params.page);
  var cookie = rememberCookie(params && params.cookie);
  return fetchList(buildSearchUrl(keyword, page), cookie);
}

async function loadDetail(link) {
  var url = normalizeUrl(link);
  if (!url) {
    return null;
  }

  try {
    var html = await fetchHtml(url, getStoredCookie());
    var $ = Widget.html.load(html);
    var title = cleanText(
      $("h1.entry-title").first().text() ||
        $("article h1").first().text() ||
        $("h1").first().text() ||
        $("title").first().text()
    );
    var content = $(".entry-content").first();
    if (!content.length) {
      content = $(".post-content").first();
    }
    if (!content.length) {
      content = $("article").first();
    }

    var images = collectDetailImages($, content);
    var poster = images[0] || "";
    var description = cleanText(
      content
        .find("p")
        .filter(function () {
          return !$(this).find("img, iframe, video, script, style").length;
        })
        .first()
        .text()
    );
    if (!description) {
      description = cleanText(
        $('meta[name="description"]').attr("content") ||
          $('meta[property="og:description"]').attr("content") ||
          ""
      );
    }

    return {
      id: url,
      type: "url",
      mediaType: "movie",
      title: title || url,
      posterPath: poster,
      backdropPath: poster,
      coverUrl: poster,
      description: description,
      backdropPaths: images,
      genreItems: parseGenres($),
      relatedItems: parseRelatedItems($, url),
      link: url,
    };
  } catch (error) {
    console.error("SupJav loadDetail failed:", error.message || error);
    return null;
  }
}

async function fetchList(url, cookie) {
  try {
    var html = await fetchHtml(url, cookie);
    var $ = Widget.html.load(html);
    return parseListItems($);
  } catch (error) {
    console.error("SupJav fetchList failed:", error.message || error);
    return [];
  }
}

async function fetchHtml(url, cookie) {
  var headers = {};
  for (var key in SUPJAV_HEADERS) {
    headers[key] = SUPJAV_HEADERS[key];
  }
  if (cookie) {
    headers.Cookie = cookie;
  }

  var response = await Widget.http.get(url, {
    headers: headers,
  });
  var html = response && response.data ? response.data : "";
  if (isChallengeHtml(html)) {
    throw new Error("站点返回验证页，无法解析。请先在浏览器打开 supjav.com 通过验证，再把 Cookie 填到模块参数里；通常会包含 cf_clearance。");
  }
  return html;
}

function buildListUrl(page) {
  if (page <= 1) {
    return SUPJAV_TAG_URL;
  }
  return SUPJAV_TAG_URL + "/page/" + page + "/";
}

function buildSearchUrl(keyword, page) {
  var url = SUPJAV_ZH_URL + "/?s=" + encodeURIComponent(keyword);
  if (page > 1) {
    url += "&paged=" + page;
  }
  return url;
}

function parseListItems($) {
  var items = [];
  var seen = {};
  var candidates = $("article, .post, .post-item, .loop-item, .item, .video, .video-item");

  candidates.each(function () {
    var item = parseCard($, $(this));
    if (!item || seen[item.link]) {
      return;
    }
    seen[item.link] = true;
    items.push(item);
  });

  if (items.length) {
    return items;
  }

  $("a[href]").each(function () {
    var card = $(this);
    if (!card.find("img").length) {
      return;
    }
    var item = parseCard($, card);
    if (!item || seen[item.link]) {
      return;
    }
    seen[item.link] = true;
    items.push(item);
  });

  return items;
}

function parseRelatedItems($, currentUrl) {
  var items = [];
  var seen = {};
  var containers = $(".related, .related-posts, #related, .yarpp-related, .post-related, .recommended, .recommend, .posts");

  containers.each(function () {
    parseListItemsFromContainer($, $(this), items, seen, currentUrl);
  });

  if (!items.length) {
    $("h2, h3, h4").each(function () {
      var heading = cleanText($(this).text()).toLowerCase();
      if (heading.indexOf("related") === -1 && heading.indexOf("推荐") === -1 && heading.indexOf("相关") === -1) {
        return;
      }
      parseListItemsFromContainer($, $(this).parent(), items, seen, currentUrl);
    });
  }

  return items;
}

function parseListItemsFromContainer($, container, items, seen, currentUrl) {
  container.find("article, .post, .post-item, .loop-item, .item, .video, .video-item").each(function () {
    var item = parseCard($, $(this));
    appendRelatedItem(item, items, seen, currentUrl);
  });

  if (items.length) {
    return;
  }

  container.find("a[href]").each(function () {
    var link = $(this);
    if (!link.find("img").length) {
      return;
    }
    var item = parseCard($, link);
    appendRelatedItem(item, items, seen, currentUrl);
  });
}

function appendRelatedItem(item, items, seen, currentUrl) {
  if (!item || item.link === currentUrl || seen[item.link]) {
    return;
  }
  seen[item.link] = true;
  items.push(item);
}

function parseCard($, card) {
  var linkNode = pickLink($, card);
  var link = normalizeUrl(linkNode.attr("href"));
  if (!link || !isSupjavPostUrl(link)) {
    return null;
  }

  var imageNode = card.find("img").first();
  var image = normalizeUrl(
    imageNode.attr("data-src") ||
      imageNode.attr("data-original") ||
      imageNode.attr("data-lazy-src") ||
      imageNode.attr("src") ||
      ""
  );
  var title = cleanText(
    card.find(".entry-title a, .post-title a, h1 a, h2 a, h3 a").first().text() ||
      linkNode.attr("title") ||
      imageNode.attr("alt") ||
      linkNode.text()
  );
  var description = cleanElementText($, card.find(".entry-meta, .post-meta, .meta, time").first());

  if (!title) {
    return null;
  }

  return {
    id: link,
    type: "url",
    mediaType: "movie",
    title: title,
    posterPath: image,
    backdropPath: image,
    coverUrl: image,
    description: description,
    link: link,
  };
}

function pickLink($, card) {
  var titleLink = card.find(".entry-title a[href], .post-title a[href], h1 a[href], h2 a[href], h3 a[href]").first();
  if (titleLink.length) {
    return titleLink;
  }

  var imageLink = card.find("a[href]").filter(function () {
    return $(this).find("img").length > 0;
  }).first();
  if (imageLink.length) {
    return imageLink;
  }

  if (card.is("a[href]")) {
    return card;
  }

  return card.find("a[href]").first();
}

function parseGenres($) {
  var genres = [];
  var seen = {};

  $('a[rel="tag"], .tags a, .tagcloud a, a[href*="/tag/"]').each(function () {
    var title = cleanText($(this).text());
    var href = normalizeUrl($(this).attr("href"));
    if (!title || !href || seen[href]) {
      return;
    }
    seen[href] = true;
    genres.push({
      id: href,
      title: title,
    });
  });

  return genres;
}

function collectImages($, container) {
  var images = [];
  var seen = {};

  collectBackgroundImages($, container, images, seen);

  container.find("img").each(function () {
    var image = normalizeUrl(
      $(this).attr("data-src") ||
        $(this).attr("data-original") ||
        $(this).attr("data-lazy-src") ||
        $(this).attr("src") ||
        ""
    );
    if (!image || seen[image] || isIgnoredImage(image)) {
      return;
    }
    seen[image] = true;
    images.push(image);
  });

  return images;
}

function collectDetailImages($, content) {
  var images = [];
  var seen = {};

  collectBackgroundImages($, $("#player-wrap, .player-wrap"), images, seen);
  collectImagesInto($, $(".post-meta, .post-content, .entry-content"), images, seen);
  if (!images.length && content && content.length) {
    collectImagesInto($, content, images, seen);
  }

  return images;
}

function collectImagesInto($, container, images, seen) {
  collectBackgroundImages($, container, images, seen);
  container.find("img").each(function () {
    var image = normalizeUrl(
      $(this).attr("data-src") ||
        $(this).attr("data-original") ||
        $(this).attr("data-lazy-src") ||
        $(this).attr("src") ||
        ""
    );
    if (!image || seen[image] || isIgnoredImage(image)) {
      return;
    }
    seen[image] = true;
    images.push(image);
  });
}

function collectBackgroundImages($, container, images, seen) {
  container.each(function () {
    appendStyleImage($(this).attr("style"), images, seen);
  });
  container.find("[style]").each(function () {
    appendStyleImage($(this).attr("style"), images, seen);
  });
}

function appendStyleImage(style, images, seen) {
  var image = extractStyleImage(style);
  if (!image || seen[image] || isIgnoredImage(image)) {
    return;
  }
  seen[image] = true;
  images.push(image);
}

function extractStyleImage(style) {
  var match = String(style || "").match(/url\((['"]?)(.*?)\1\)/i);
  return match ? normalizeUrl(match[2]) : "";
}

function normalizePage(page) {
  var value = Number(page || 1);
  if (!isFinite(value) || value < 1) {
    return 1;
  }
  return Math.floor(value);
}

function rememberCookie(raw) {
  var cookie = normalizeCookie(raw);
  if (cookie && Widget.storage && Widget.storage.set) {
    Widget.storage.set(COOKIE_STORAGE_KEY, cookie);
  }
  return cookie || getStoredCookie();
}

function getStoredCookie() {
  if (!Widget.storage || !Widget.storage.get) {
    return "";
  }
  return normalizeCookie(Widget.storage.get(COOKIE_STORAGE_KEY));
}

function normalizeCookie(raw) {
  if (!raw) {
    return "";
  }
  return String(raw)
    .trim()
    .replace(/^cookie\s*:\s*/i, "")
    .trim();
}

function normalizeUrl(url) {
  if (!url) {
    return "";
  }
  var value = String(url).trim();
  if (!value || value.indexOf("data:") === 0 || value.indexOf("javascript:") === 0) {
    return "";
  }
  if (value.indexOf("//") === 0) {
    return "https:" + value;
  }
  if (value.indexOf("/") === 0) {
    return SUPJAV_BASE_URL + value;
  }
  return value;
}

function cleanText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function cleanElementText($, element) {
  if (!element || !element.length) {
    return "";
  }
  var clone = element.clone();
  clone.find("*").each(function () {
    $(this).before(" ");
    $(this).after(" ");
  });
  return cleanText(clone.text());
}

function isSupjavPostUrl(url) {
  if (url.indexOf(SUPJAV_BASE_URL) !== 0) {
    return false;
  }
  if (url.indexOf("/tag/") !== -1 || url.indexOf("/category/") !== -1 || url.indexOf("/page/") !== -1) {
    return false;
  }
  return true;
}

function isIgnoredImage(url) {
  var lowered = String(url).toLowerCase();
  return (
    lowered.indexOf("logo") !== -1 ||
    lowered.indexOf("avatar") !== -1 ||
    lowered.indexOf("icon") !== -1 ||
    lowered.indexOf("ads") !== -1 ||
    lowered.indexOf("banner") !== -1
  );
}

function isChallengeHtml(html) {
  var text = String(html || "").toLowerCase();
  return (
    text.indexOf("cf-mitigated") !== -1 ||
    text.indexOf("challenge-platform") !== -1 ||
    text.indexOf("cloudflare") !== -1 && text.indexOf("cf-browser-verification") !== -1 ||
    text.indexOf("checking your browser") !== -1 ||
    text.indexOf("just a moment") !== -1
  );
}
