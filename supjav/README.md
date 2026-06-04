# SupJav

[SupJav](https://supjav.com/) 的 ForwardWidgets 插件。

- 版本：1.1.0
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

## 导入地址

```text
https://cdn.jsdelivr.net/gh/akafive/nano-scripts@main/supjav/SupJav.js
```

如果通过 `fw-proxy` 私有代理访问，路径为：

```text
https://<fw-proxy-domain>/supjav/SupJav.js?key=<PROXY_SECRET>
```

## 注意

当前网络环境直连 `supjav.com` 可能超时或被重置；如果站点返回验证页或更换播放器结构，详情页播放地址解析可能失败。
