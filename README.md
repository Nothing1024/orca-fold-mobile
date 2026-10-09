<h1 align="center">
  <a href="https://github.com/Nothing1024/orca-mobile"><img src="resources/build/icon.png" alt="Orca Mobile" width="64" valign="middle" /></a> Orca Mobile
</h1>

<p align="center">
  <a href="https://github.com/Nothing1024/orca-mobile"><img src="https://img.shields.io/github/stars/Nothing1024/orca-mobile?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <a href="https://github.com/Nothing1024/orca-mobile/releases"><img src="https://img.shields.io/github/v/release/Nothing1024/orca-mobile?style=flat&amp;color=08C" alt="Latest release" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
  <img src="https://img.shields.io/badge/Android%20%7C%20iOS-4493F8?style=flat-square" alt="Supported platforms: Android and iOS" />
</p>

<p align="center">
  <sub><a href="docs/readme/README.zh-CN.md">中文</a></sub>
</p>

<p align="center">
  <strong>The phone and tablet companion for Orca.</strong><br/>
  Watch workspaces, open a session, and steer the agent on your paired desktop from one screen.
</p>

<h3 align="center"><a href="https://github.com/Nothing1024/orca-mobile/releases/latest"><ins>Download the Android APK</ins></a></h3>

<p align="center">
  <img src="docs/assets/readme-hero.jpg" alt="Orca Mobile on a tablet: workspace list and session pane on the left, live agent terminal on the right" width="960" />
</p>

## What you get

On a phone, the host list opens into one workspace at a time. On a wide tablet, the same host keeps the workspace list, the session list, and the live terminal on one screen.

- **Workspaces** — Group paired-desktop worktrees by repo, search them, and open the one you want.
- **Sessions** — See the terminals and agent sessions in the selected workspace, including which one is running.
- **Live terminal** — Read the agent transcript and type the next prompt from the phone or tablet.
- **Files, Git, and commands** — Jump to files, source control, and quick commands without leaving the host.

The agent still runs on the paired desktop. This app is the remote screen for that host.

## Install

Android builds are published on this repo. The latest release is [Orca Mobile 0.0.53](https://github.com/Nothing1024/orca-mobile/releases/tag/mobile-android-v0.0.53) (`arm64-v8a`).

- **[Download the latest APK](https://github.com/Nothing1024/orca-mobile/releases/latest/download/app-release.apk)**
- Pair it with a desktop running Orca. The desktop hosts the mobile connection; the phone does not run the agent by itself.

Local setup, pairing, and the mock host are documented in [`mobile/README.md`](mobile/README.md).

---

## Agents

The phone shows whatever CLI agent is already running in a desktop terminal. Claude Code, Codex, Grok, and any other terminal agent on that host show up the same way.

## Feedback

Missing something in the mobile app? [Open an issue](https://github.com/Nothing1024/orca-mobile/issues).

## License

Orca Mobile is free and open source under the [MIT License](LICENSE).
