# SupJav

[SupJav](https://supjav.com/) 的 ForwardWidgets 插件。

- 版本：1.1.1
- 脚本：`SupJav.js`

## 功能

- 最新影片列表
- 任意 SupJav 列表地址读取
- 模块内搜索
- 详情页 mp4/m3u8 播放地址解析

## v1.1.0 改动

按本仓库 `jable/Jable.js` 的写法重写：

- 搜索作为普通 `modules` 模块声明，不使用顶层 `search`
- 分页参数改为 `from`
- 搜索入口改为 `https://supjav.com/zh/?s=...`
- 列表解析改为 SupJav 的 `.posts.clearfix > .post` 结构
- 入口收敛为 `search(params)`、`loadPage(params)`、`loadDetail(link)`

## v1.1.1 改动

- 三个列表模块增加 `Cookie（可选）` 参数
- 请求会带上 Cookie，并缓存最近一次 Cookie 给 `loadDetail(link)` 复用
- 模块标记 `requiresWebView: true`
- 验证页报错改为提示先在浏览器通过验证后复制 Cookie

## 导入地址

```text
https://cdn.jsdelivr.net/gh/akafive/nano-scripts@main/supjav/SupJav.js
```

如果通过 `fw-proxy` 私有代理访问，路径为：

```text
https://<fw-proxy-domain>/supjav/SupJav.js?key=<PROXY_SECRET>
```

## 注意

如果出现“站点返回验证页，无法解析”，说明 `Widget.http` 拿到的是站点防护页，不是影片列表。请先在浏览器打开 `supjav.com` 并通过验证，再复制 Cookie 填到模块的 `Cookie（可选）` 参数里；通常会包含 `cf_clearance`。如果填 Cookie 后仍失败，说明当前站点验证无法由 `Widget.http` 复用，只能换网络/镜像或走代理方案。
