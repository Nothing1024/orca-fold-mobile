<h1 align="center">
  <a href="https://github.com/Nothing1024/orca-fold-mobile"><img src="resources/build/icon.png" alt="Orca Fold" width="64" valign="middle" /></a> Orca Fold
</h1>

<p align="center">
  <a href="https://github.com/Nothing1024/orca-fold-mobile"><img src="https://img.shields.io/github/stars/Nothing1024/orca-fold-mobile?style=flat&amp;label=%E2%98%85&amp;color=08C" alt="GitHub stars" /></a>
  <a href="https://github.com/Nothing1024/orca-fold-mobile/releases"><img src="https://img.shields.io/github/v/release/Nothing1024/orca-fold-mobile?style=flat&amp;color=08C" alt="Latest release" /></a>
  <img src="https://img.shields.io/badge/license-MIT-08C?style=flat" alt="License: MIT" />
  <img src="https://img.shields.io/badge/unofficial-foldable%20screen-C2410C?style=flat" alt="Unofficial foldable-screen build" />
</p>

<p align="center">
  <sub><a href="docs/readme/README.zh-CN.md">中文</a></sub>
</p>

<p align="center">
  <strong>Unofficial.</strong> This is an independent foldable-screen build of the Orca mobile client.<br/>
  It is not published by Lovecast Inc. and is not an official Orca app.
</p>

<p align="center">
  Folded, you get one workspace at a time. Unfolded, the inner screen keeps the workspace list, the session list, and the live terminal together.
</p>

<h3 align="center"><a href="https://github.com/Nothing1024/orca-fold-mobile/releases/latest"><ins>Download the Android APK</ins></a></h3>

<p align="center">
  <img src="docs/assets/readme-hero.jpg" alt="Unfolded foldable screen: workspace list and session pane on the left, live agent terminal on the right" width="960" />
</p>

## What this build changes

The agent still runs on the paired desktop. This app is only the remote screen, with the wide layout aimed at a foldable inner display.

- **Folded phone** — The host list opens into one workspace at a time.
- **Unfolded inner screen** — The same host keeps workspaces, sessions, and the live terminal on one screen.
- **Workspaces** — Group paired-desktop worktrees by repo, search them, and open the one you want.
- **Sessions** — See the terminals and agent sessions in the selected workspace, including which one is running.
- **Live terminal** — Read the agent transcript and type the next prompt from the phone.
- **Files, Git, and commands** — Jump to files, source control, and quick commands without leaving the host.

## Install

Android builds are published on this repo. The latest release is [0.0.53](https://github.com/Nothing1024/orca-fold-mobile/releases/tag/mobile-android-v0.0.53) (`arm64-v8a`).

- **[Download the latest APK](https://github.com/Nothing1024/orca-fold-mobile/releases/latest/download/app-release.apk)**
- Pair it with a desktop running Orca. The desktop hosts the mobile connection; the phone does not run the agent by itself.

Local setup, pairing, and the mock host are documented in [`mobile/README.md`](mobile/README.md).

---

## Agents

The phone shows whatever CLI agent is already running in a desktop terminal. Claude Code, Codex, Grok, and any other terminal agent on that host show up the same way.

## Feedback

Layout bug on a foldable, or something missing? [Open an issue](https://github.com/Nothing1024/orca-fold-mobile/issues).

## License

Original Orca is copyright Lovecast Inc. and licensed under MIT. This unofficial foldable-screen build is distributed under the same [MIT License](LICENSE).
