// 调试 Archivebate widget：跑 loadHome → loadDetail，打印 mixdrop 解包内容
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WidgetAdaptor } from "@forward-widget/libs/widget-adaptor";
import { load as cheerioLoad } from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const widgetPath = path.join(__dirname, "Archivebate-v1.2.1.js");
const src = fs.readFileSync(widgetPath, "utf-8");

// 手工 cookie jar（实机 fw 自带，Node fetch 不带）
const cookieJar = new Map(); // host -> Map<name, value>
function hostOf(u) { try { return new URL(u).host; } catch { return ""; } }
function applyCookies(url, headers) {
  const host = hostOf(url);
  if (!host) return headers;
  const map = cookieJar.get(host);
  if (!map || map.size === 0) return headers;
  const existing = headers?.Cookie || headers?.cookie || "";
  const merged = [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  return { ...headers, Cookie: existing ? `${existing}; ${merged}` : merged };
}
function captureCookies(url, respHeaders) {
  const host = hostOf(url);
  if (!host) return;
  // node fetch 把多个 set-cookie 合并成 ", " — 拆开
  const raw = respHeaders["set-cookie"] || respHeaders["Set-Cookie"] || "";
  if (!raw) return;
  const parts = raw.split(/,(?=[^;]+=[^;]+;)/g);
  let map = cookieJar.get(host);
  if (!map) { map = new Map(); cookieJar.set(host, map); }
  for (const p of parts) {
    const kv = p.split(";")[0].trim();
    const eq = kv.indexOf("=");
    if (eq > 0) map.set(kv.slice(0, eq).trim(), kv.slice(eq + 1).trim());
  }
}

// 增强 Widget：截获 http.get 对 mixdrop embed 的请求，dump 完整 packed 解码后的内容
const dumps = [];
const wrappedWidget = {
  ...WidgetAdaptor,
  html: { load: (...args) => cheerioLoad(...args) },
  http: {
    get: async (url, opts = {}) => {
      const headers = applyCookies(url, opts.headers || {});
      const r = await WidgetAdaptor.http.get(url, { ...opts, headers });
      captureCookies(url, r.headers || {});
      if (/mixdrop|m1xdrop|mxdrop/i.test(url)) {
        const html = String(r.data || "");
        const packed = html.match(/eval\(function\(p,a,c,k,e,d\)\{[\s\S]*?\}\([\s\S]*?\)\)/);
        dumps.push({ url, status: r.statusCode, len: html.length, hasPacked: !!packed });
      }
      return r;
    },
    post: async (url, body, opts = {}) => {
      const headers = applyCookies(url, opts.headers || {});
      const r = await WidgetAdaptor.http.post(url, body, { ...opts, headers });
      captureCookies(url, r.headers || {});
      return r;
    },
  },
};

const ctx = {
  Widget: wrappedWidget,
  console,
  btoa: (s) => Buffer.from(s, "binary").toString("base64"),
  WidgetMetadata: null,
  setTimeout, clearTimeout, setInterval, clearInterval,
  URL, URLSearchParams,
  Promise, JSON, Math, Date, RegExp, Array, Object, String, Number, Boolean,
  fetch,
};
ctx.globalThis = ctx;
vm.createContext(ctx);

// 注入 widget 脚本
vm.runInContext(src + "\n; this.__loadHome=loadHome; this.__loadDetail=loadDetail; this.__resolveMixdrop=resolveMixdrop; this.__unpackPacked=unpackPacked; this.__fetchBoot=fetchLivewireBootstrap; this.__callLivewire=callLivewireMethod; this.__parseCards=parseVideoCards;", ctx);

console.log("=== Step 0: raw GET archivebate.pro ===");
const probe = await wrappedWidget.http.get("https://archivebate.pro/?page=1", {
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html",
  },
});
console.log("status:", probe.statusCode, "len:", String(probe.data||"").length);
const hasLivewire = /wire:initial-data/.test(String(probe.data||""));
const hasHomeVideos = /home-videos/.test(String(probe.data||""));
const titleM = String(probe.data||"").match(/<title>([^<]*)<\/title>/);
console.log("title:", titleM?.[1], "hasLivewire:", hasLivewire, "hasHomeVideos:", hasHomeVideos);

console.log("\n=== Step 0.5: inspect bootstrap & livewire chain ===");
try {
  const boot = await ctx.__fetchBoot("https://archivebate.pro/?page=1", "home-videos");
  console.log("boot.csrf:", (boot.csrf||"").slice(0,16), "...");
  console.log("boot.initial.fingerprint:", JSON.stringify(boot.initial?.fingerprint));
  console.log("boot.initial.serverMemo keys:", Object.keys(boot.initial?.serverMemo||{}));
  // 手动发一次 livewire POST，看完整响应
  const body = {
    fingerprint: boot.initial.fingerprint,
    serverMemo: boot.initial.serverMemo,
    updates: [{ type: "callMethod", payload: { id: "x", method: "loadVideos", params: [] } }],
  };
  const rawResp = await wrappedWidget.http.post(
    "https://archivebate.pro/livewire/message/home-videos",
    JSON.stringify(body),
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Content-Type": "application/json",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "X-Livewire": "true",
        "X-CSRF-TOKEN": boot.csrf,
        Referer: "https://archivebate.pro/?page=1",
        Origin: "https://archivebate.pro",
      },
    }
  );
  console.log("raw livewire status:", rawResp.statusCode);
  console.log("raw livewire data type:", typeof rawResp.data);
  const rawText = typeof rawResp.data === "string" ? rawResp.data : JSON.stringify(rawResp.data);
  console.log("raw livewire body (first 1500 chars):", rawText.slice(0, 1500));

  const lwHtml = await ctx.__callLivewire(boot, "home-videos", "loadVideos", []);
  console.log("livewire html length:", (lwHtml||"").length);
  console.log("livewire html head:", String(lwHtml||"").slice(0, 800));
  const cards = ctx.__parseCards(lwHtml);
  console.log("parsed cards:", cards.length);
  if (cards.length === 0) {
    // 看看 lwHtml 里有没有视频卡片标志
    const hasSection = /section.*video_item/i.test(lwHtml||"");
    const hasWatch = /\/watch\//.test(lwHtml||"");
    console.log("lwHtml hasSection:", hasSection, "hasWatch:", hasWatch);
  } else {
    console.log("first card:", JSON.stringify(cards[0], null, 2));
  }
} catch (e) {
  console.error("bootstrap chain error:", e.message);
}

console.log("\n=== Step 1: loadHome({page:1}) ===");
let list = [];
try {
  list = await ctx.__loadHome({ page: "1" });
} catch (e) {
  console.error("loadHome error:", e.message);
}
console.log("count:", list.length);
console.log("first item:", JSON.stringify(list[0], null, 2));

if (!list[0]?.link) {
  console.error("No link in first item, abort");
  process.exit(1);
}

console.log("\n=== Step 2: loadDetail() ===");
const detail = await ctx.__loadDetail(list[0].link);
console.log("detail result:", JSON.stringify(detail, null, 2));

console.log("\n=== Step 3: mixdrop calls dumped ===");
console.log(JSON.stringify(dumps, null, 2));

// 立即测 URL 可达性
if (detail.videoUrl) {
  console.log("\n=== Step 3.5: probe videoUrl reachability (signed URL) ===");
  // 取 mixdrop 域名的 cookie
  const mixCookies = cookieJar.get("mixdrop.ag");
  const cookieStr = mixCookies && mixCookies.size > 0
    ? [...mixCookies.entries()].map(([k,v])=>`${k}=${v}`).join("; ")
    : "";
  console.log("  mixdrop cookies captured:", cookieStr || "(none)");
  const probes = [
    { name: "no header", h: {} },
    { name: "exact customHeaders from script", h: detail.customHeaders || {} },
    { name: "customHeaders + mixdrop cookie", h: { ...(detail.customHeaders||{}), Cookie: cookieStr } },
    { name: "GET-range simulating player", h: { ...(detail.customHeaders||{}), Cookie: cookieStr, Range: "bytes=0-1023" }, method: "GET" },
  ];
  for (const p of probes) {
    try {
      const r = await fetch(detail.videoUrl, { method: p.method || "HEAD", headers: p.h });
      console.log(`  ${p.name}: HTTP ${r.status}, content-length=${r.headers.get("content-length")}, content-type=${r.headers.get("content-type")}`);
    } catch (e) {
      console.log(`  ${p.name}: error ${e.message}`);
    }
  }
  // 再测一个全新的 fresh URL：重新跑一次 loadDetail，立刻 fetch
  console.log("\n  --- fresh loadDetail then immediate fetch ---");
  const detail2 = await ctx.__loadDetail(list[0].link);
  console.log("  fresh videoUrl:", detail2.videoUrl);
  const cookieStr2 = (cookieJar.get("mixdrop.ag") && [...cookieJar.get("mixdrop.ag").entries()].map(([k,v])=>`${k}=${v}`).join("; ")) || "";
  const r2 = await fetch(detail2.videoUrl, { method: "GET", headers: { ...detail2.customHeaders, Cookie: cookieStr2, Range: "bytes=0-1023" } });
  console.log("  fresh probe: HTTP", r2.status, "ct-len:", r2.headers.get("content-length"), "ct-type:", r2.headers.get("content-type"));
  // 不带任何额外头
  const r3 = await fetch(detail2.videoUrl, { method: "GET", headers: { "User-Agent": "Mozilla/5.0", Range: "bytes=0-1023" } });
  console.log("  fresh bare GET: HTTP", r3.status, "ct-len:", r3.headers.get("content-length"), "ct-type:", r3.headers.get("content-type"));
}

// 找到 mixdrop 页面，手动重新解包打印所有候选源
console.log("\n=== Step 4: re-decode packed body for inspection ===");
if (dumps.length > 0) {
  const lastEmbed = dumps[dumps.length - 1].url;
  const r = await fetch(lastEmbed, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36", Referer: list[0].link },
  });
  const html = await r.text();
  const m = html.match(/eval\(function\(p,a,c,k,e,d\)\{[\s\S]*?\}\([\s\S]*?\)\)/);
  if (m) {
    const decoded = ctx.__unpackPacked(m[0]);
    if (decoded) {
      // 找所有 *url= 模式
      const allUrls = [...decoded.matchAll(/(\b\w*url)\s*=\s*["']([^"']+)["']/gi)];
      console.log("found URL-ish assignments in decoded body:");
      for (const u of allUrls) console.log("  ", u[1], "=", u[2].slice(0, 200));
      // 单独抓 m3u8 / mp4 直链
      const directs = [...decoded.matchAll(/https?:\/\/[^"'\s>]+\.(?:m3u8|mp4)[^"'\s>]*/gi)];
      console.log("direct mp4/m3u8 URLs in body:");
      directs.slice(0, 10).forEach(d => console.log("  ", d[0]));
    } else {
      console.log("unpack failed");
    }
  } else {
    console.log("no packed JS found in last embed page");
  }
}
