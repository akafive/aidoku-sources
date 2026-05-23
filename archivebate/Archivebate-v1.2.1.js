// Archivebate ForwardWidgets 组件
// 站点：https://archivebate.pro
// 列表数据通过 Laravel Livewire 异步加载，需要先抓页面拿 csrf-token + 组件 fingerprint，再 POST /livewire/message
WidgetMetadata = {
  id: "archivebate",
  title: "Archivebate",
  description: "Webcam 录播聚合（Chaturbate / Stripchat / Camsoda 等）",
  author: "claude",
  site: "https://archivebate.pro",
  version: "1.2.1",
  requiredVersion: "0.0.2",
  // mixdrop 签名 URL 寿命约 20 秒，详情结果不缓存
  detailCacheDuration: 0,
  modules: [
    // 最新（首页）
    {
      title: "最新",
      description: "全平台最新录播",
      requiresWebView: false,
      functionName: "loadHome",
      cacheDuration: 1800,
      params: [
        { name: "page", title: "页码", type: "page", description: "页码", value: "1" },
      ],
    },
    // 平台
    {
      title: "平台",
      description: "按平台浏览",
      requiresWebView: false,
      functionName: "loadByPlatform",
      cacheDuration: 1800,
      params: [
        {
          name: "platform",
          title: "平台",
          type: "enumeration",
          description: "选择平台",
          enumOptions: [
            { title: "Chaturbate", value: "chaturbate" },
            { title: "Stripchat", value: "stripchat" },
            { title: "Camsoda", value: "camsoda" },
            { title: "Bongacams", value: "bongacams" },
            { title: "Cam4", value: "cam4" },
            { title: "TikTok", value: "tiktok" },
            { title: "Instagram", value: "instagram" },
            { title: "OnlyFans", value: "onlyfans" },
            { title: "Twitch", value: "twitch" },
            { title: "YouTube", value: "youtube" },
          ],
          value: "chaturbate",
        },
        { name: "page", title: "页码", type: "page", description: "页码", value: "1" },
      ],
    },
    // 主播
    {
      title: "主播",
      description: "按主播用户名查看其录播",
      requiresWebView: false,
      functionName: "loadByModel",
      cacheDuration: 1800,
      params: [
        {
          name: "username",
          title: "用户名",
          type: "input",
          description: "主播用户名（区分大小写按站点要求）",
          value: "",
          placeholders: [
            { title: "ellalowe", value: "ellalowe" },
            { title: "lana", value: "lana" },
          ],
        },
        {
          name: "popular",
          title: "排序",
          type: "enumeration",
          description: "排序方式",
          enumOptions: [
            { title: "最新", value: "0" },
            { title: "最热", value: "1" },
          ],
          value: "0",
        },
        { name: "page", title: "页码", type: "page", description: "页码", value: "1" },
      ],
    },
    // 我的关注（需登录 — 通过 params.cookie 传入 Cookie，或在本地 fork 后填入 FOLLOWING_COOKIE 常量）
    {
      title: "我的关注",
      description: "已关注主播的最新录播（需在 Cookie 参数里粘贴登录态）",
      requiresWebView: false,
      functionName: "loadFollowing",
      cacheDuration: 600,
      params: [
        {
          name: "cookie",
          title: "Cookie（可选）",
          type: "input",
          description: "粘贴登录后的 Cookie（XSRF-TOKEN + archivebate_session + remember_web_xxx）",
          value: "",
        },
        { name: "page", title: "页码", type: "page", description: "页码", value: "1" },
      ],
    },
    // 搜索
    {
      title: "搜索",
      description: "搜索主播并加载其录播",
      requiresWebView: false,
      functionName: "search",
      cacheDuration: 1800,
      params: [
        { name: "keyword", title: "关键词", type: "input", description: "主播名关键词" },
        {
          name: "popular",
          title: "排序",
          type: "enumeration",
          description: "排序方式",
          enumOptions: [
            { title: "最新", value: "0" },
            { title: "最热", value: "1" },
          ],
          value: "0",
        },
        { name: "page", title: "页码", type: "page", description: "页码", value: "1" },
      ],
    },
  ],
};

const SITE = "https://archivebate.pro";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// 内置 Cookie：默认留空（出于安全考虑不在公开仓库里写明文 cookie）。
// 使用"我的关注"模块时通过 params.cookie 传入，或本地 fork 后在此填入。
const FOLLOWING_COOKIE = "";

// ---------------- 工具函数 ----------------

// 极简 base64（站点用 URL slug 是 base64 of name）
function b64encode(str) {
  if (typeof btoa === "function") return btoa(str);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  let i = 0;
  while (i < str.length) {
    const c1 = str.charCodeAt(i++) & 0xff;
    const c2 = i < str.length ? str.charCodeAt(i++) & 0xff : NaN;
    const c3 = i < str.length ? str.charCodeAt(i++) & 0xff : NaN;
    const e1 = c1 >> 2;
    const e2 = ((c1 & 3) << 4) | (c2 >> 4);
    const e3 = isNaN(c2) ? 64 : (((c2 & 15) << 2) | (c3 >> 6));
    const e4 = isNaN(c3) ? 64 : c3 & 63;
    output += chars.charAt(e1) + chars.charAt(e2) +
              (e3 === 64 ? "=" : chars.charAt(e3)) +
              (e4 === 64 ? "=" : chars.charAt(e4));
  }
  return output;
}

// HTML 实体反转义
function unescapeHtml(s) {
  if (!s) return "";
  return String(s)
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

// 把 archivebate.com 写法的图片域名换成 .pro
function normalizeUrl(u) {
  if (!u) return u;
  return String(u).replace(/^https?:\/\/archivebate\.com/i, SITE);
}

function safeJsonParse(str) {
  try { return JSON.parse(str); } catch (e) { return null; }
}

// 从 URL 提取 origin（含协议+主机）
function originOf(u) {
  const m = String(u || "").match(/^(https?:\/\/[^\/]+)/i);
  return m ? m[1] : "";
}

// ---------------- Livewire 抓取核心 ----------------

// 拉取页面，返回该页面里指定组件的 fingerprint+serverMemo+csrfToken
async function fetchLivewireBootstrap(pageUrl, componentName) {
  const resp = await Widget.http.get(pageUrl, {
    headers: {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": SITE + "/",
    },
  });
  if (!resp || !resp.data) {
    throw new Error("无法访问 " + pageUrl);
  }
  const html = String(resp.data);

  const csrfMatch = html.match(/<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i);
  const csrf = csrfMatch ? csrfMatch[1] : "";

  const escapedName = componentName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const reList = [
    new RegExp('wire:initial-data="([^"]+&quot;name&quot;:&quot;' + escapedName + '&quot;[^"]*)"', "i"),
    new RegExp("wire:initial-data='([^']+\"name\":\"" + escapedName + '"[^\']*)\'', "i"),
  ];
  let initialRaw = "";
  for (const re of reList) {
    const m = html.match(re);
    if (m) {
      initialRaw = m[1];
      break;
    }
  }
  if (!initialRaw) {
    throw new Error("未找到 Livewire 组件: " + componentName);
  }
  const initialJson = unescapeHtml(initialRaw);
  let initial;
  try {
    initial = JSON.parse(initialJson);
  } catch (e) {
    throw new Error("解析 Livewire 初始数据失败: " + e.message);
  }
  return { csrf, initial, html, pageUrl };
}

// 调用 Livewire 组件方法，返回服务端渲染的 HTML 片段
async function callLivewireMethod(boot, componentName, method, params) {
  const body = {
    fingerprint: boot.initial.fingerprint,
    serverMemo: boot.initial.serverMemo,
    updates: [
      {
        type: "callMethod",
        payload: { id: "x", method: method, params: params || [] },
      },
    ],
  };
  const url = SITE + "/livewire/message/" + componentName;
  const resp = await Widget.http.post(url, JSON.stringify(body), {
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/json",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
      "X-Livewire": "true",
      "X-CSRF-TOKEN": boot.csrf,
      "Referer": boot.pageUrl,
      "Origin": SITE,
    },
  });
  if (!resp || !resp.data) {
    throw new Error("Livewire 请求失败: " + componentName + "/" + method);
  }
  const data = typeof resp.data === "string" ? safeJsonParse(resp.data) : resp.data;
  const html = data && data.effects && data.effects.html ? data.effects.html : "";
  return html;
}

async function loadLivewireVideos(pageUrl, componentName, methodName) {
  const boot = await fetchLivewireBootstrap(pageUrl, componentName);
  const html = await callLivewireMethod(boot, componentName, methodName, []);
  return parseVideoCards(html);
}

// ---------------- 视频卡片解析 ----------------

function parseVideoCards(html) {
  if (!html) return [];
  const $ = Widget.html.load(html);
  const items = [];
  $("section.video_item").each((_, el) => {
    const $el = $(el);
    const $a = $el.find('a[href*="/watch/"]').first();
    const watchUrl = $a.attr("href");
    if (!watchUrl) return;

    const $video = $el.find("video.video-splash-mov").first();
    const poster = $video.attr("poster") || "";
    const previewUrl = $video.find("source").first().attr("src") || "";

    let duration = "";
    const $dur = $el.find(".duration").first();
    if ($dur.length) {
      duration = $dur.text().replace(/\s+/g, " ").trim();
    }

    const $info = $el.find(".info").first();
    const $authorA = $info.find('a[href*="/profile/"]').first();
    const author = $authorA.text().trim();
    const meta = $info.find("p").first().text().replace(/\s+/g, " ").trim();

    const title = author ? (meta ? author + " · " + meta.split("·")[1].trim() : author) : "Archivebate";

    items.push({
      id: watchUrl,
      type: "url",
      title: title,
      backdropPath: normalizeUrl(poster),
      previewUrl: normalizeUrl(previewUrl),
      link: watchUrl,
      mediaType: "movie",
      description: meta || "",
      releaseDate: duration,
      playerType: "system",
    });
  });
  return items;
}

// ---------------- 主页 ----------------
async function loadHome(params) {
  const page = parseInt(params.page || "1", 10) || 1;
  const url = SITE + "/?page=" + page;
  return await loadLivewireVideos(url, "home-videos", "loadVideos");
}

// ---------------- 平台 ----------------
async function loadByPlatform(params) {
  const platform = String(params.platform || "chaturbate");
  const page = parseInt(params.page || "1", 10) || 1;
  const slug = b64encode(platform);
  const url = SITE + "/platform/" + slug + "?page=" + page;
  return await loadLivewireVideos(url, "filter.platform", "load_platform_videos");
}

// ---------------- 我的关注 ----------------
// 把用户粘贴的 cookie 字符串规范化（去掉 "Cookie:" 前缀和首尾空白）
function normalizeCookie(raw) {
  if (!raw) return "";
  let s = String(raw).trim();
  s = s.replace(/^cookie\s*:\s*/i, "");
  return s.trim();
}

// 判断响应是否为登录页（仅当主体确实是登录表单时才视为未登录，避免页脚 Sign In 链接误触发）
function isLoginPage(html) {
  if (!html) return false;
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch && /(sign\s*in|log\s*in|登\s*录)/i.test(titleMatch[1]) && !/following|profile|platform/i.test(titleMatch[1])) {
    if (/<input[^>]+type=["']password["']/i.test(html)) return true;
  }
  return false;
}

async function loadFollowing(params) {
  const page = parseInt(params.page || "1", 10) || 1;
  // 用户输入优先；空则用内置 cookie
  const cookie = normalizeCookie(params.cookie) || FOLLOWING_COOKIE;
  if (!cookie) {
    throw new Error("Cookie 未配置");
  }

  const url = SITE + "/following?page=" + page;
  const headers = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": SITE + "/",
    "Cookie": cookie,
  };

  let resp;
  try {
    resp = await Widget.http.get(url, { headers: headers });
  } catch (e) {
    // 框架可能把 302 当作错误抛出 —— 这就是 cookie 失效的信号
    if (/302|301|redirect/i.test(String(e && e.message || ""))) {
      throw new Error("Cookie 失效或未登录，请在浏览器重新登录后再复制 Cookie");
    }
    throw e;
  }
  if (!resp) throw new Error("无法访问 " + url);

  const html = String(resp.data || "");
  if (isLoginPage(html)) {
    throw new Error("Cookie 失效或未登录，请在浏览器重新登录后再复制 Cookie");
  }

  // SSR 已渲染卡片
  const direct = parseVideoCards(html);
  if (direct.length > 0) return direct;

  // 否则查找 livewire 组件 — 注意此处也要带 cookie
  const names = [...new Set(
    [...html.matchAll(/&quot;name&quot;:&quot;([^&]+)&quot;/g)].map(m => m[1])
  )];
  const candidate = names.find(n => /follow/i.test(n)) || names.find(n => /video/i.test(n));
  if (!candidate) return [];

  const initMatch = html.match(/wire:init="([^"]+)"/);
  const method = initMatch ? initMatch[1] : "loadVideos";

  // 把 cookie 注入到 livewire 调用里
  const csrfMatch = html.match(/<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i);
  const csrf = csrfMatch ? csrfMatch[1] : "";
  const escapedName = candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wireRe = new RegExp('wire:initial-data="([^"]+&quot;name&quot;:&quot;' + escapedName + '&quot;[^"]*)"', "i");
  const initRaw = html.match(wireRe);
  if (!initRaw) return [];
  let initial;
  try { initial = JSON.parse(unescapeHtml(initRaw[1])); } catch (e) { return []; }

  const body = {
    fingerprint: initial.fingerprint,
    serverMemo: initial.serverMemo,
    updates: [{ type: "callMethod", payload: { id: "x", method: method, params: [] } }],
  };
  const lwResp = await Widget.http.post(SITE + "/livewire/message/" + candidate, JSON.stringify(body), {
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/json",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
      "X-Livewire": "true",
      "X-CSRF-TOKEN": csrf,
      "Referer": url,
      "Origin": SITE,
      "Cookie": cookie,
    },
  });
  if (!lwResp || !lwResp.data) return [];
  const lwData = typeof lwResp.data === "string" ? safeJsonParse(lwResp.data) : lwResp.data;
  const lwHtml = lwData && lwData.effects && lwData.effects.html ? lwData.effects.html : "";
  return parseVideoCards(lwHtml);
}

// ---------------- 主播 ----------------
async function loadByModel(params) {
  const username = String(params.username || "").trim();
  if (!username) return [];
  const popular = String(params.popular || "0") === "1";
  const page = parseInt(params.page || "1", 10) || 1;
  const url = SITE + "/profile/" + encodeURIComponent(username) + "?page=" + page;
  const boot = await fetchLivewireBootstrap(url, "profile.model-videos");
  if (popular && boot.initial && boot.initial.serverMemo && boot.initial.serverMemo.data) {
    boot.initial.serverMemo.data.popular = true;
  }
  const html = await callLivewireMethod(boot, "profile.model-videos", "load_profile_videos", []);
  return parseVideoCards(html);
}

// ---------------- 搜索 ----------------
async function search(params) {
  const keyword = String(params.keyword || "").trim();
  if (!keyword) return [];
  const page = parseInt(params.page || "1", 10) || 1;
  const popular = String(params.popular || "0") === "1";

  const apiUrl = SITE + "/api/v1/search?query=" + encodeURIComponent(keyword);
  const apiResp = await Widget.http.get(apiUrl, {
    headers: {
      "User-Agent": UA,
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "Referer": SITE + "/",
    },
  });
  const apiData = apiResp && apiResp.data
    ? (typeof apiResp.data === "string" ? safeJsonParse(apiResp.data) : apiResp.data)
    : null;
  const list = apiData && Array.isArray(apiData.data) ? apiData.data : [];
  if (list.length === 0) return [];

  const lower = keyword.toLowerCase();
  list.sort((a, b) => {
    const an = String(a.username || "").toLowerCase();
    const bn = String(b.username || "").toLowerCase();
    if (an === lower && bn !== lower) return -1;
    if (bn === lower && an !== lower) return 1;
    if (an.startsWith(lower) && !bn.startsWith(lower)) return -1;
    if (bn.startsWith(lower) && !an.startsWith(lower)) return 1;
    return an.length - bn.length;
  });

  const target = list[0];
  const username = String(target.username || "");
  if (!username) return [];

  const url = SITE + "/profile/" + encodeURIComponent(username) + "?page=" + page;
  const boot = await fetchLivewireBootstrap(url, "profile.model-videos");
  if (popular && boot.initial && boot.initial.serverMemo && boot.initial.serverMemo.data) {
    boot.initial.serverMemo.data.popular = true;
  }
  const html = await callLivewireMethod(boot, "profile.model-videos", "load_profile_videos", []);
  return parseVideoCards(html);
}

// ---------------- 详情 ----------------
async function loadDetail(link) {
  if (!link) return null;
  const resp = await Widget.http.get(link, {
    headers: {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Referer": SITE + "/",
    },
  });
  if (!resp || !resp.data) return null;
  const $ = Widget.html.load(String(resp.data));

  const iframeSrc = $("iframe.video-frame").first().attr("src")
    || $(".player iframe").first().attr("src")
    || $("iframe").first().attr("src")
    || "";

  let poster = "";
  const playerStyle = $(".player").first().attr("style") || "";
  const mPoster = playerStyle.match(/url\(([^)]+)\)/);
  if (mPoster) poster = mPoster[1].replace(/^["']|["']$/g, "");
  if (!poster) {
    poster = $('meta[property="og:image"]').attr("content") || "";
  }

  const author = $('a[href*="/profile/"]').first().text().trim();
  const infoText = $(".info p").first().text().replace(/\s+/g, " ").trim();

  let videoUrl = "";
  let videoReferer = link;
  let videoOrigin = "";
  let blockNotice = "";
  if (iframeSrc) {
    try {
      const r = await resolveEmbed(iframeSrc, link);
      if (r && r.videoUrl) {
        videoUrl = r.videoUrl;
        videoReferer = r.referer || iframeSrc;
        videoOrigin = r.origin || originOf(videoReferer);
      }
    } catch (e) {
      // 反爬保护的提示要透传给用户；其他失败静默
      if (e && /反爬保护/.test(e.message)) {
        blockNotice = "⚠️ " + e.message;
      }
    }
  }

  const result = {
    id: link,
    type: "detail",
    title: author ? author + " - Archivebate" : "Archivebate",
    description: blockNotice ? (blockNotice + "\n\n" + infoText) : infoText,
    posterPath: normalizeUrl(poster),
    backdropPath: normalizeUrl(poster),
    link: link,
    mediaType: "movie",
  };

  if (videoUrl) {
    result.videoUrl = videoUrl;
    // 按 fw 官方规范，playerType 合法值仅 "system" | "app"；
    // 统一走 system（宿主原生播放器，iOS 端 AVPlayer 对 mp4 / m3u8 多音轨均原生支持）
    result.playerType = "system";
    result.customHeaders = {
      "User-Agent": UA,
      "Referer": videoReferer,
      "Origin": videoOrigin || originOf(videoReferer),
    };
  }
  return result;
}

// ---------------- 嵌入解析 ----------------
async function resolveEmbed(embedUrl, pageRef) {
  if (/mixdrop\./i.test(embedUrl) || /m1xdrop\./i.test(embedUrl) || /mxdrop\./i.test(embedUrl)) {
    return await resolveMixdrop(embedUrl, pageRef);
  }
  return null;
}

async function resolveMixdrop(embedUrl, pageRef) {
  const resp = await Widget.http.get(embedUrl, {
    headers: {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Referer": pageRef || SITE + "/",
    },
  });
  if (!resp || !resp.data) return null;
  const html = String(resp.data);
  // mixdrop 经常 302 到 m1xdrop.click 等镜像，取响应里的最终 URL
  const finalUrl = resp.url || resp.responseURL || embedUrl;
  const embedOrigin = originOf(finalUrl) || originOf(embedUrl);

  const packed = html.match(/eval\(function\(p,a,c,k,e,d\)\{[\s\S]*?\}\([\s\S]*?\)\)/);
  if (!packed) return null;
  const decoded = unpackPacked(packed[0]);
  if (!decoded) return null;

  // 优先原画 mp4 (wurl)，因为 mixdrop 的 m3u8 是分轨流（视频/音频分开），
  // 走系统/ijk 播放器只能拿到视频轨，会没声音；mp4 是音视频合流，必有声音。
  // 仅在拿不到 mp4 时才回退到 m3u8。
  const candidates = [
    /MDCore\.wurl\s*=\s*["']([^"']+)["']/i,
    /\bwurl\s*=\s*["']([^"']+)["']/i,
    /MDCore\.vurl\s*=\s*["']([^"']+)["']/i,
    /\bvurl\s*=\s*["']([^"']+)["']/i,
    /MDCore\.hlsurl\s*=\s*["']([^"']+\.m3u8[^"']*)["']/i,
    /\bhlsurl\s*=\s*["']([^"']+\.m3u8[^"']*)["']/i,
  ];
  let raw = "";
  for (const re of candidates) {
    const m = decoded.match(re);
    if (m && m[1] && m[1].trim()) { raw = m[1].trim(); break; }
  }
  if (!raw) {
    const m = decoded.match(/https?:[^"'\s>]+\.(?:mp4|m3u8)[^"'\s>]*/);
    if (m) raw = m[0];
  }
  if (!raw) return null;

  // 协议补齐
  if (raw.startsWith("//")) raw = "https:" + raw;
  else if (raw.startsWith("/")) raw = embedOrigin + raw;

  return { videoUrl: raw, referer: finalUrl, origin: embedOrigin };
}

// dean edwards p,a,c,k,e,d 解包
function unpackPacked(src) {
  const r = src.match(/\}\s*\(\s*'([\s\S]*?)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([\s\S]*?)'\.split\('\|'\)/);
  if (!r) return null;
  const payload = r[1].replace(/\\\\/g, "\\").replace(/\\'/g, "'");
  const a = parseInt(r[2], 10);
  const c = parseInt(r[3], 10);
  const k = r[4].split("|");
  return payload.replace(/\b\w+\b/g, (w) => {
    let n = 0;
    for (const ch of w) {
      const v = ch >= "a" ? ch.charCodeAt(0) - 87 : parseInt(ch, 10);
      if (isNaN(v)) return w;
      n = n * a + v;
    }
    return n < c && k[n] ? k[n] : w;
  });
}
