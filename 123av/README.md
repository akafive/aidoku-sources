# 123AV

[123AV](https://123av.com/zh/dm9) 的 ForwardWidgets 插件。

- 版本：1.0.0
- 主脚本：`123AV.js`

## 功能

- 分类列表和分页
- 搜索
- 详情页解析
- 封面、截图、简介、相关推荐
- 播放地址兜底提取
- dandanplay 通用弹幕链路

## 导入地址

```text
https://cdn.jsdelivr.net/gh/akafive/nano-scripts@main/123av/123AV.js
```

如需通过私有代理访问，路径为：

```text
/123av/123AV.js
```

## 已知风险

本地直接请求 `123av.com` 时可能被站点按网络或 TLS 指纹拦截。插件提供了全局 `baseUrl` 参数，如果实机网络访问默认域名失败，可以填入可访问镜像域名。

## 验证

已用离线 mock HTML 回测：

```bash
node --check widgets/123av.js
node test-123av.js
```
