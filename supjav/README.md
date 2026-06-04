# SupJav

[SupJav](https://supjav.com/) 的 ForwardWidgets 插件。

- 版本：1.0.0
- 脚本：`SupJav.js`

## 功能

- 最新影片列表
- 热门/推荐列表
- 分类/标签路径读取
- 顶部搜索
- 详情页解析
- 公开 mp4/m3u8 资源解析

## 导入地址

```text
https://cdn.jsdelivr.net/gh/akafive/nano-scripts@main/supjav/SupJav.js
```

如果通过 `fw-proxy` 私有代理访问，路径为：

```text
https://<fw-proxy-domain>/supjav/SupJav.js?key=<PROXY_SECRET>
```

## 注意

当前网络环境直连 `supjav.com` 可能超时或被重置。脚本提供了 `baseUrl` 和 `Cookie` 全局参数，遇到镜像域名、地区阻断或站点验证时，可以在 ForwardWidgets 里配置后再试。
