<h1 align="center">
  <a href="https://github.com/Nothing1024/orca-mobile"><img src="../../resources/build/icon.png" alt="Orca Mobile" width="64" valign="middle" /></a> Orca Mobile
</h1>

<p align="center">
  <a href="https://github.com/Nothing1024/orca-mobile"><img src="https://img.shields.io/github/stars/Nothing1024/orca-mobile?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub Star 数" /></a>
  <a href="https://github.com/Nothing1024/orca-mobile/releases"><img src="https://img.shields.io/github/v/release/Nothing1024/orca-mobile?style=flat&amp;color=08C" alt="最新版本" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="许可证: MIT" />
  <img src="https://img.shields.io/badge/Android%20%7C%20iOS-4493F8?style=flat-square" alt="支持的平台：Android 和 iOS" />
</p>

<p align="center">
  <sub><a href="../../README.md">English</a></sub>
</p>

<p align="center">
  <strong>Orca 的手机和平板伴侣。</strong><br/>
  在一块屏幕上看工作区、打开会话，并指挥已配对桌面上的智能体。
</p>

<h3 align="center"><a href="https://github.com/Nothing1024/orca-mobile/releases/latest"><ins>下载 Android APK</ins></a></h3>

<p align="center">
  <img src="../assets/readme-hero.jpg" alt="平板上的 Orca Mobile：左侧是工作区和会话，右侧是正在运行的智能体终端" width="960" />
</p>

## 你能做什么

手机上，主机列表一次进入一个工作区。宽屏平板上，同一个主机把工作区列表、会话列表和实时终端放在同一屏。

- **工作区** — 按仓库分组已配对桌面上的 worktree，搜索并打开你要的那个。
- **会话** — 查看当前工作区里的终端和智能体会话，包括哪一个正在跑。
- **实时终端** — 在手机或平板上阅读智能体记录，并输入下一条提示。
- **文件、Git 和命令** — 不离开这台主机就能打开文件、源码管理和快捷命令。

智能体仍然跑在已配对的桌面上。这个应用是那台主机的远程屏幕。

## 安装

Android 构建发布在本仓库。最新版本是 [Orca Mobile 0.0.53](https://github.com/Nothing1024/orca-mobile/releases/tag/mobile-android-v0.0.53)（`arm64-v8a`）。

- **[下载最新 APK](https://github.com/Nothing1024/orca-mobile/releases/latest/download/app-release.apk)**
- 与正在运行 Orca 的桌面配对。桌面负责移动连接；手机本身不运行智能体。

本地启动、配对和 mock 主机写在 [`mobile/README.md`](../../mobile/README.md)。

## 智能体

手机显示的是桌面终端里已经在跑的 CLI 智能体。Claude Code、Codex、Grok，以及那台主机上的其他终端智能体，显示方式相同。

## 反馈

移动应用缺了什么？[开一个 issue](https://github.com/Nothing1024/orca-mobile/issues)。

## 许可证

Orca Mobile 基于 [MIT 许可证](../../LICENSE) 免费开源。
