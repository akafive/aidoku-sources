# fw-widgets

[ForwardWidgets](https://github.com/InchStudio/ForwardWidgets) 自定义插件集合。

## 插件列表

| 插件 | 站点 | 状态 |
|---|---|---|
| [archivebate](./archivebate) | https://archivebate.pro | v1.2.1 修复版 |
| [jable](./jable) | https://jable.tv | v1.3.0 规范化 `playerType` |

## 开发约定

- 每个插件一个独立子目录，包含主脚本 + 配套调试 driver + 单独 README
- 主脚本命名沿用上游的 `<名称>-v<版本>.js`
- 调试 driver 命名 `debug-<名称>.mjs`，依赖 [`@forward-widget/libs`](https://www.npmjs.com/package/@forward-widget/libs)
- 单个插件的修改原因、根因分析写在该插件的 README 里
