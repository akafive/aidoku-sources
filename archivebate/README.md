# Archivebate ForwardWidgets 修复版

针对 [ForwardWidgets](https://github.com/InchStudio/ForwardWidgets) 框架的 `Archivebate` 插件 v1.2.1，修复"播放视频没有声音"的问题。

## 修改清单

改动全部集中在 `Archivebate-v1.2.1.js`。

### 1. 候选源顺序：mp4 优先于 m3u8

`resolveMixdrop()` 解析 mixdrop packed JS 时，原版优先匹配 `hlsurl`（m3u8）。但实测发现：

- 部分 mixdrop 视频根本没有 `hlsurl`，只有 `wurl`（mp4 原画）。原正则的兜底分支 `https?:[^"'\s>]+\.(?:m3u8|mp4)` 又把 m3u8 放在前面，会误匹配到 packed body 里 player.js 字面量中的 `.m3u8` 字符串。
- m3u8 是分轨流（视频/音频独立 segment），mixdrop 对音频 segment 的防盗链比视频严，导致"有画面没声音"。

修复：把 `wurl` 提到第一位，新增 `vurl` 兜底，m3u8 退到最后；兜底正则也改成 `mp4|m3u8` 顺序。

### 2. `playerType` 统一为 `"system"`

原版 `loadDetail` 里写：

```js
result.playerType = /\.m3u8(\?|$)/i.test(videoUrl) ? "ijk" : "system";
```

但根据官方类型定义（`@forward-widget/libs/env`），`playerType` 合法值**仅 `"system" | "app"`**，`"ijk"` 不合规，fw 拿到未知值的行为未定义。

修复：统一改成 `"system"`，让宿主原生播放器处理（iOS 上是 AVPlayer，对 mp4 / m3u8 均原生支持）。

## 已知遗留问题

`customHeaders` 字段在 fw 官方 `VideoItem` 类型定义里**不存在**。脚本里设置的 `Referer / Origin / User-Agent` 是否真的被 fw 实机读取，目前没有公开文档证实。

实测显示 mixdrop 的 mp4 URL **必须带正确的 Referer** 才能访问（否则 HTTP 403）。如果 fw 实机不读 `customHeaders`，那这个 mp4 即使被解析出来也无法播放——需要在 fw App 内实测确认。

## 调试工具

`debug-archivebate.mjs` 是一个 Node 端的调试 driver，依赖 `@forward-widget/libs`：

```bash
npm install @forward-widget/libs cheerio
node debug-archivebate.mjs
```

会完整跑一遍 `loadHome → loadDetail`，并打印：

- Livewire bootstrap 是否成功
- mixdrop packed JS 解出来的所有候选源
- 最终 mp4 URL 的可达性（带 / 不带 Referer 的 HTTP 状态）

driver 自带 cookie jar，模拟实机 fw 的隐式 cookie 管理。

## 来源信息

- 站点：https://archivebate.pro
- 原插件版本：1.2.1
- fw 框架：https://github.com/InchStudio/ForwardWidgets
- fw 开发库：https://www.npmjs.com/package/@forward-widget/libs
