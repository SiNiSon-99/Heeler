<div align="center">

<img src="docs/images/logo.png" width="96" alt="Heeler logo" />

# Heeler

**[herdr](https://herdr.dev) 的原生 iOS 伴侣应用 —— herdr 是一个 agent 优先的终端运行时。**

[![CI](https://img.shields.io/github/actions/workflow/status/SiNiSon-99/Heeler/ci.yml?branch=main&label=CI&style=flat-square)](https://github.com/SiNiSon-99/Heeler/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-6F42C1?style=flat-square)](LICENSE)
[![Swift](https://img.shields.io/badge/Swift-6-F05138?logo=swift&logoColor=white&style=flat-square)](https://www.swift.org)
[![iOS](https://img.shields.io/badge/iOS-18%2B-000000?logo=apple&logoColor=white&style=flat-square)](https://developer.apple.com/ios/)

[English](./README.md) | 简体中文

</div>

---

Heeler 是一个 **agent 控制台**：把所有机器上正在运行的 coding agent 汇成一个原生仪表盘，按「谁需要你」排序。打开一个 Agent 即可阅读并操控它的实时终端，在原生 Composer 里用完整的 iOS 键盘起草，一次 Send 投递完整消息 —— 全程只走普通 SSH。

这是独立维护中的分支，目前没有本分支发布的 iOS 构建或推送中继。前台 SSH 控制台不需要中继；通知和实时活动默认关闭，只有配置有效的自定义中继后才能启用。原版 Heeler 中继地址会被拒绝，已有 Host 注册文件和密钥保留到明确移除时。

## 截图

| Agent Console + 搜索 | 实时终端 | Direct Input + Terminal 键盘 |
| --- | --- | --- |
| <img src="docs/images/console-iphone.png" width="240" alt="iPhone 上支持置顶、状态显示和搜索的 Agent Console" /> | <img src="docs/images/live-terminal-iphone.png" width="240" alt="iPhone 上使用 Direct Input 的 Agent 实时终端" /> | <img src="docs/images/agent-iphone.png" width="240" alt="iPhone 上使用 Direct Input、快捷键和完整 Terminal 键盘的 Agent 终端" /> |

| Shell + Terminal 键盘 | Skills | 实时活动 |
| --- | --- | --- |
| <img src="docs/images/terminal-iphone.png" width="240" alt="iPhone 上使用 Keys 模式和完整 Terminal 键盘的 Shell 终端" /> | <img src="docs/images/skills-iphone.png" width="240" alt="iPhone 上 Composer 的 Skills 建议" /> | <img src="docs/images/live-activity-iphone.png" width="240" alt="iPhone 锁屏上实时跟踪 Agent 的实时活动" /> |

<a href="docs/ipad-screenshots.md"><img src="output/app-store/ipad-13/sources/05-windowed-console.png" width="760" alt="Heeler in a floating iPad window" /></a>

[View iPad screenshots](docs/ipad-screenshots.md)

## 功能

- **Console** —— 所有机器上的 Agent 汇成一个按状态排序的列表（Blocked
  排最前），可按 Host 过滤，实时更新。
- **Attach** —— libghostty 渲染的 Agent 真实终端：原生历史回看、也能驱动全屏
  TUI 的惯性触摸滚动、长按选择、接管失效的终端占用者，并静默收集网页链接
  供稍后打开。
- **Composer** —— 在本地用完整的 iOS 键盘起草（自动纠错、输入法、听写），
  一次 Send 投递；工具键盘另有 Agent 控制键、Agent Skills、可复用的
  Snippets 和终端外观。
- **Terminal** —— 在 Agent 的目录打开普通 shell，带 Text / Keys 两种模式，
  每个工作区复用同一个 tab。
- **附件** —— 把照片或最大 64 MiB 的文件经 SFTP 暂存到 Host，并把路径
  插入草稿。
- **扫码配对** —— 扫描 Pairing Code 即可添加机器；密钥在设备上生成，私钥
  不离开 Keychain，配对码同时固定 host key 指纹。
- **通知 + 实时活动** —— Agent 进入 Blocked 或 Done 时的端到端加密推送，
  以及锁屏 / 灵动岛上实时跟踪 Agent 的横幅；中继永远读不到内容
  （[PRIVACY.md](PRIVACY.md)）。
- **Worktrees** —— 让 Agent 从工作区仓库的干净检出上启动。
- **外观** —— 跟随系统 / 浅色 / 深色；30 个终端主题，浅色深色各有独立
  槽位；内置 JetBrains Mono 与 IBM Plex Mono；双指缩放字号。
- **跳板机** —— 经 SSH 跳板访问不可直连的机器，两跳各自校验密钥。

## 连接原理

Heeler 通过 SSH 使用 herdr 的 JSON API：每个请求经 direct-streamlocal
通道直连 `herdr.sock`，一条长连接承载事件流，交互终端则在 SSH PTY 上运行
`herdr agent attach --takeover`。前提只有 SSH 访问和一个运行中的
herdr —— 不改服务器、不装额外软件包。SSH 服务器需允许 stream-local 转发
（OpenSSH 默认开启）；若被关闭，引导流程会明确指出。

不可直连的机器可以放在 SSH 跳板机之后：

- [逐步搭建远程访问](docs/guides/vps-jump-host-setup.md)
- [架构、安全边界与 VPS 迁移手册](docs/guides/vps-jump-host.md)

## 添加机器

在运行 herdr 的机器上（Node >= 20、herdr >= 0.7.5、已启用 OpenSSH 服务器
—— macOS 上是 **系统设置 > 通用 > 共享 > 远程登录**）：

```bash
herdr plugin install SiNiSon-99/Heeler/plugin --ref REVIEWED_COMMIT_SHA --yes
herdr plugin action invoke heeler.pair
```

用应用扫描弹出的 Pairing Code 二维码，机器即被添加为 Host —— 地址、
host key 指纹和 SSH 密钥注册全部由配对码承载。在应用里为该 Host 启用通知
后，同一个[插件](plugin/README.md)负责投递加密通知。

## 技术栈

- SwiftUI，iOS 18+，iPhone 与 iPad。0.1.8 恢复 iPad 支持，含 Magic Keyboard 快捷键、多窗口和拖放。
- 仓库内 `Packages/HeelerSSH`（libssh2 + OpenSSL）负责 SSH
- [libghostty-spm](https://github.com/lakr233/libghostty-spm) 负责终端仿真与 Metal 渲染

选型依据见 `docs/adr/`，其中传输层方案经过多轮验证后才最终确定。

## 参与贡献

欢迎 Issue 和 PR：仓库结构、构建与测试、提交约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 状态

这是尚未发布到 TestFlight 或 App Store 的独立分支。原项目的下载链接不是本分支的构建。原作者署名和 Apache 2.0 许可保留在仓库历史与 [LICENSE](LICENSE) 中。本分支与 herdr 项目无隶属关系。
