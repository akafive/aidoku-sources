# Jable

[Jable.tv](https://jable.tv) 的 ForwardWidgets 插件。

- 上游作者：nibiru｜MakkaPakka｜蝴蝶
- 版本：1.3.0

## 本仓库的改动

仅一处，符合 [fw 官方规范](https://github.com/InchStudio/ForwardWidgets) 的修正：

```diff
- playerType: "ijk",
+ playerType: "system",
```

**理由**：`@forward-widget/libs/env` 的 `VideoItem` 类型定义中，`playerType` 合法值仅 `"system" | "app"`，`"ijk"` 不合规，宿主对未知值行为未定义。`"system"` 在 iOS 上是 AVPlayer，对 HLS（含多音轨）有原生支持。

## 已知风险

Jable 的视频源是 HLS（`var hlsUrl = ...`），且 jable.tv 有防盗链——必须带正确 `Referer` 才能加载 segment。

脚本里设置了 `customHeaders.Referer`，但 fw 官方类型定义中**没有 `customHeaders` 字段**。是否被实机读取需要在 fw App 内实测：

- 如果能正常播放且有声音 → 修复有效
- 如果 403 / 无音轨 → fw 实机不读 `customHeaders`，需要换方案（代理一层 / 重写为 mp4 直链等）

参见根目录 `../archivebate/README.md` 的同类问题分析。
