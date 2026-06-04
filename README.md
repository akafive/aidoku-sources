# nano-scripts

一些自用的小脚本集合。

## 列表

| 子目录 | 站点 | 备注 |
|---|---|---|
| [123av](./123av) | https://123av.com/zh/dm9 | v1.0.0 列表/搜索/详情/弹幕 |
| [archivebate](./archivebate) | https://archivebate.pro | v1.2.1 修复无声播放 |
| [jable](./jable) | https://jable.tv | v1.3.0 规范化字段 |
| [supjav](./supjav) | https://supjav.com | v1.1.0 按 Jable 写法重写 |

## 通过 jsdelivr 加速访问

国内/移动端通过 jsdelivr CDN 可以直接拉到 raw 文件，无需访问 GitHub：

```
https://cdn.jsdelivr.net/gh/akafive/nano-scripts@main/<path>
```

例如：

```
https://cdn.jsdelivr.net/gh/akafive/nano-scripts@main/123av/123AV.js
https://cdn.jsdelivr.net/gh/akafive/nano-scripts@main/archivebate/Archivebate-v1.2.1.js
https://cdn.jsdelivr.net/gh/akafive/nano-scripts@main/jable/Jable.js
https://cdn.jsdelivr.net/gh/akafive/nano-scripts@main/supjav/SupJav.js
```

### 强制刷新 jsdelivr 缓存

更新脚本后，jsdelivr 默认缓存 12 小时（边缘）+ 7 天（浏览器）。要立即生效：

```
https://purge.jsdelivr.net/gh/akafive/nano-scripts@main/<path>
```

在浏览器打开 purge URL 即可。

## 目录约定

- 每个子目录一个主题，自带 README 说明改动
- 主脚本沿用上游命名（`<名称>-v<版本>.js`）
- 调试 driver 命名 `debug-<名称>.mjs`
