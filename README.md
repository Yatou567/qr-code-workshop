# 二维码工坊 · QR Code Workshop

![二维码工坊：离线网页与 Chrome 扩展](docs/assets/banner.svg)

**一个离线 HTML 文件 + 一个 Chrome 扩展，把网址和文字变成可下载的二维码。**

[在线使用](https://yatou567.github.io/qr-code-workshop/) · [下载最新版本](https://github.com/Yatou567/qr-code-workshop/releases/latest) · [问题反馈](https://github.com/Yatou567/qr-code-workshop/issues)

无需注册，无后端服务，不上传输入内容。二维码生成库随项目内置，生成过程不依赖 CDN 或网络。

## 选择适合你的版本

| 功能 | 离线网页版 | Chrome 扩展 |
| --- | --- | --- |
| 网址、中文、普通文字生成二维码 | ✓ | ✓ |
| PNG / SVG 下载 | ✓ | ✓ |
| 完全本地生成 | ✓ | ✓ |
| 自动读取当前网页地址 | — | ✓ |
| 提取、去重、搜索页面链接 | — | ✓ |
| 悬停预览，点击保留二维码 | — | ✓ |
| 调整 PNG 尺寸及容错级别 | ✓ | 默认 1024 px / M |

## 快速开始

### 离线网页版

1. 从 Releases 下载 `qr-code-workshop-offline.html`，或下载仓库中的 [`docs/index.html`](docs/index.html)。
2. 用浏览器打开该 HTML 文件。
3. 输入网址或文字，点击「生成二维码」，再下载 PNG 或 SVG。

单文件可直接复制到其他电脑使用。通过网页托管打开时，首次加载页面需要网络；保存 HTML 到本机后可离线使用。扫描后的网页访问或文件下载仍需联网。

### Chrome 扩展

1. 从 Releases 下载 `qr-code-workshop-chrome.zip` 并解压。
2. 打开 `chrome://extensions`，开启「开发者模式」。
3. 点击「加载已解压的扩展程序」，选择包含 `manifest.json` 的 `extension` 文件夹。
4. 将「二维码工坊 · 网页链接助手」固定到工具栏。
5. 打开网页，点击扩展图标即可查看当前页面及其链接的二维码。

也可以直接加载本仓库的 [`extension/`](extension/) 文件夹。[完整安装与使用说明](docs/chrome-install.md)。本扩展尚未发布到 Chrome 应用商店。

## 如何使用链接预览

- 插件打开后自动显示当前网页的二维码。
- 在**插件弹窗内**悬停链接条目，预览该链接的二维码。
- 移开鼠标后恢复之前保留的内容；点击条目即可保留二维码，再进行下载。
- 左侧输入框实时生成自定义内容，支持中文。
- 搜索框可筛选链接名称或网址；网页动态加载内容后，点击「刷新」重新读取。
- 键盘 Tab 聚焦链接也能预览，Enter 保留。

## 隐私与权限

- 所有编码和图片生成均在本机完成，没有分析统计、跟踪脚本、账号系统或上传接口。
- 插件仅请求 `activeTab` 和 `scripting`，用于用户打开插件时临时读取当前页面。
- 不保存浏览记录、提取出的链接或输入内容。
- 下载的二维码会包含原始内容，请自行选择分享对象。

详见 [隐私说明](docs/privacy.md)。

## 已知边界

- 读取页面 `a` / `area` 元素的 `href`，解析相对地址并去重；一次最多 5000 个不同链接。
- 支持可读取的同源 iframe 和开放 Shadow DOM；无法读取跨域 iframe、封闭 Shadow DOM 或尚未加载的内容。
- 不解析没有 `href`、只由 JavaScript 控制跳转的按钮。
- Chrome 内部页面和扩展商店等可能禁止读取链接，手动输入仍可使用。
- 读取本地 HTML 时，需要在扩展详情页开启「允许访问文件网址」。
- `file:`、`localhost` 等地址可能只在原设备可用；二维码不会替你托管本地文件。
- 网址长度受二维码容量限制。保留二维码周围白边有助于识别。
- 工具栏图标需要点击后打开弹窗，不会仅悬停图标就弹出二维码。

## 开发与验证

运行环境：Node.js 20 或更高版本。没有需要安装的 npm 依赖。

```sh
npm test
npm run build
```

`npm test` 检查 Manifest、离线页面结构、链接提取、交互状态和输入边界；`npm run build` 生成离线 HTML、Chrome 扩展 ZIP 和 SHA-256 校验文件到 `dist/`。

浏览器验收项目见 [测试说明](docs/testing.md)。自动逻辑测试不等同于真实 Chrome 扩展安装测试。

```text
extension/       Chrome Manifest V3 扩展，可直接加载
  qrcode.js      内置二维码生成库
  extract.js     当前页面链接提取
  popup.*        弹窗与二维码交互

docs/index.html  可独立离线使用的单文件网页版
scripts/         无第三方依赖的打包工具
tests/           Node.js 内置测试
.github/         CI、问题模板和 PR 模板
```

欢迎通过 Issues 报告问题或提交 Pull Request。请先阅读 [贡献说明](CONTRIBUTING.md)。

## 许可证

项目采用 [MIT License](LICENSE)。内嵌的 qrcode-generator 1.4.4 遵循其原始 MIT 许可，见 [第三方声明](THIRD_PARTY_NOTICES.md)。
