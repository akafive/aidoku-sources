# Archivebate ForwardWidgets 修复版

针对 [ForwardWidgets](https://github.com/InchStudio/ForwardWidgets) 框架的 `Archivebate` 插件 v1.2.1，修复"播放视频没有声音"的问题。

## 最终诊断

经过完整调试（见下方"调试工具"一节，配合 ffprobe 实测），**根本原因**：

> mixdrop 对**部分视频**启用了反爬保护——通过 `MDCore.wurl` 暴露的 mp4 实际上只是 **1-30 秒、0.4-2 MB 的无音轨预览片段**。完整视频的签名 URL 必须经过 `reCAPTCHA v3 token + CSRF token + $.post + vserver + vfile` 流程才能换取，**而 reCAPTCHA 必须在浏览器里执行**——Node/fw 这种无浏览器 JS 引擎的环境无法绕过。

具体反爬代码位置（混淆后）在 `https://mixdrop.ag/player/videoplayer.2.1.7.min.js`：

```js
$.post('', {
  token: <recaptcha_token>,
  csrf:  <meta name=csrf>,
  server: MDCore.vserver,
  file:   MDCore.vfile,
  a:      <const>
}, function(resp) { /* resp.url 才是带签名的完整 mp4 */ })
```

## 修改清单

### 1. 候选源顺序：mp4 优先于 m3u8（`resolveMixdrop`）

原版优先匹配 `hlsurl`（m3u8）。但实测：
- mixdrop 当前几乎所有视频都**没有** `hlsurl`，只有 `wurl`
- 原兜底正则把 m3u8 放在 mp4 前，会误匹配到 packed body 里 player.js 字面量中的 `.m3u8` 字符串

修复：`wurl` 提到首位，新增 `vurl` 兜底，m3u8 退到最后；兜底正则也改成 `mp4|m3u8` 顺序。

### 2. `playerType` 统一为 `"system"`

原版根据扩展名选 `"ijk" | "system"`。但官方类型定义（`@forward-widget/libs/env` 的 `VideoItem`）：

```ts
playerType?: 'system' | 'app';
```

`"ijk"` 不合规，宿主行为未定义。修复：统一改为 `"system"`，让宿主原生播放器（iOS 上是 AVPlayer）处理。

### 3. **预览片段检测**（核心修复 - 解决"无声音"）

在 `resolveMixdrop` 末尾对 mp4 URL 做一次 `Range: bytes=0-0` 探测，从 `content-range` 头读取真实文件大小：

- **< 5MB** → 判定为反爬预览片段（实测预览都在 0.4-2MB 之间），抛错并通过 `description` 把警告透传给用户
- **≥ 5MB** → 视为完整视频，正常返回 `videoUrl`

`loadDetail` 配套增加 `blockNotice` 透传逻辑：被识别为预览的视频在详情页 `description` 顶部显示 `⚠️ 此视频被 mixdrop 反爬保护...`，避免用户误以为播放器问题。

### 实测验证（5 个连续视频）

| 视频 | 真实大小 | 检测结果 |
|---|---|---|
| 1 | 1.09 MB / 16s | ⚠️ 预览片段，阻断 |
| 2 | 0.42 MB / 5s | ⚠️ 预览片段，阻断 |
| 3 | 1.5 GB | ✅ 完整视频，可播 |
| 4 | 1.4 GB | ✅ 完整视频，可播 |
| 5 | (大于 5MB) | ✅ 完整视频，可播 |

## 已知遗留问题

1. **`customHeaders` 字段非官方**：fw 官方 `VideoItem` 类型里没有此字段。脚本设的 `Referer / Origin / User-Agent` 是否被 fw 实机播放器实际读取，需在 App 内验证。如果不读，正常视频也会因防盗链 403——这超出 widget 能控制的范围。

2. **反爬覆盖率随机**：实测约 30-50% 的视频被锁成预览。哪些被锁取决于 mixdrop 后端策略，无规律。

3. **5MB 阈值**：未来 mixdrop 若加大预览片段，需调整 `resolveMixdrop` 里的 `5 * 1024 * 1024` 常量。

## 调试工具

`debug-archivebate.mjs` 是 Node 端的调试 driver，依赖 `@forward-widget/libs`：

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
