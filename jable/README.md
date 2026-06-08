# Jable

[Jable.tv](https://jable.tv) 的 ForwardWidgets 插件。

- 上游作者：nibiru/makka/el/廿二日
- 版本：2.3.6

## 本仓库的改动

使用 `jable-2.3.6.js` 更新主脚本，脚本结构紧跟官网，覆盖聚合、标签、女优、预告和推荐等入口。

## 已知风险

Jable 的视频源是 HLS（`var hlsUrl = ...`），且 jable.tv 有防盗链——必须带正确 `Referer` 才能加载 segment。

脚本里可能设置 `customHeaders.Referer`，但 fw 官方类型定义中**没有 `customHeaders` 字段**。是否被实机读取需要在 fw App 内实测：

- 如果能正常播放且有声音 → 修复有效
- 如果 403 / 无音轨 → fw 实机不读 `customHeaders`，需要换方案（代理一层 / 重写为 mp4 直链等）

参见根目录 `../archivebate/README.md` 的同类问题分析。
