# SupJav FC2PPV

[SupJav FC2PPV](https://supjav.com/zh/tag/fc2ppv) 的 ForwardWidgets 插件。

- 版本：1.0.1
- 脚本：`SupJav-FC2PPV.js`

## 功能

- FC2PPV 标签列表
- 列表翻页
- 全站搜索和搜索翻页
- 详情页图片、标签和相关推荐
- Cookie 参数复用 SupJav 浏览器验证结果

## v1.0.1 改动

- 脚本结构改为贴合 SupJav 网页端：模块内搜索 + FC2PPV 列表模块
- 分页参数改为 `from`
- 列表解析收敛到 `.posts.clearfix > .post`、`a.img`、`h3 a[rel=bookmark]`
- 详情页按 `.post-meta`、`.post-content`、底部 `.posts.clearfix` 解析图片、标签和相关推荐
- 忽略详情页广告 iframe，避免误把广告域当播放器抓取

## 导入地址

```text
https://cdn.jsdelivr.net/gh/akafive/nano-scripts@main/supjav/SupJav-FC2PPV.js
```

如果通过 `fw-proxy` 代理访问，路径为：

```text
https://<fw-proxy-domain>/supjav/SupJav-FC2PPV.js?key=<PROXY_SECRET>
```

## 注意

SupJav 当前会返回 Cloudflare 验证页。若插件提示“站点返回验证页，无法解析”，请先在浏览器打开 `supjav.com` 并通过验证，再复制 Cookie 填到插件的 `Cookie（可选）` 参数里；通常会包含 `cf_clearance`。
