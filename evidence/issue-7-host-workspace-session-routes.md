# Issue #7 调研：主机目录与 Session route 的重复入口

- 父 Issue：https://github.com/Nothing1024/orca-mobile/issues/1
- 子 Issue：https://github.com/Nothing1024/orca-mobile/issues/7
- 范围：只读调研。未改 `mobile/` 生产源，未改 #8 及之后 Issue 的验收正文。
- 代码基线：`main` @ `3d68889b`（`chore: private Orca Mobile snapshot`）
- 云端回写：Issue API 没有 SSH 认证。`gh` 未登录，已保存 token 请求 `GET /user` 返回 401。本轮按 SSH git 把本文件推到分支 `research/issue-7-navigation-entries`，不推 `main`。`ssh -T git@github.com` 身份是 `Nothing1024`，密钥 `~/.ssh/id_rsa2`。

## 结论

主机选择之后，今天有两套「选什么看什么」的导航，并且在宽屏上会同时出现。

1. 旧工作区目录是 `HostScreen`。手机上它占满 `/h/:hostId`。宽屏上它固定在 `app/h/_layout.tsx` 的左侧，右侧是整条 host stack。
2. Session 路由 `/h/:hostId/session/:worktreeId` 自己再画一条 `MobileSessionRail`。宽屏上这条 rail 嵌在右侧详情里，于是左侧变成「工作区目录 + Session rail」两列。手机上这条 rail 是盖在 Session 上的抽屉。
3. Rail 上的 “Sessions” 不是工作区下的会话树。它是当前工作区里的 tab：`terminal`、`agent-session`、`markdown`、`file`、`browser`。
4. 同一条 Session URL 有 8 个生产入口。另外还有一组同级整页（Files、Source Control、Review、Agent History、Tasks、Web shell），右侧不是「当前 Session 的 Terminal 或 Chat」。
5. 宽屏是否打开外层目录，只看整窗 `isWideLayout`（宽 ≥ 700 且短边 ≥ 600）。`half-opened` 本身不参与判定；只有 `isSeparating` 且铰链矩形有效时才进入 `separating`。这是 #4 的输入，本调研不改它的验收。

## 用户现在实际走过的路

主路径：

1. `/` 主机列表点一台主机 → `/h/:hostId`。
2. 工作区行点按 → `/h/:hostId/session/:worktreeId?name=...`，并调用 `worktree.activate`。
3. 宽屏：左栏仍是工作区目录，右栏里再出现 Session rail 和 Terminal/Chat。
4. 手机：Session 顶栏打开抽屉，抽屉只列当前工作区的 tab。返回文案是 “Back to worktrees”，回到 `/h/:hostId`。

失败/旁路：

- 继续卡片指向的工作区已确认缺失：不进 Session，改去 `/h/:hostId` 并带 `worktree-missing`。
- 配对凭证缺失：去 `/pair-scan`，不进主机。
- Session 打不开工作区：`use-mobile-session-foundation` 用 `worktree-missing` 弹回主机路由。
- 离开 Session 时若没有历史栈：`replace` 到 `/h/:hostId`，避免在根路由上 `GO_BACK`。

## 两套导航分别在哪

### 旧工作区目录：`HostScreen`

挂载点：

- 手机：`mobile/app/h/[hostId]/index.tsx` 的 `HostListScreen`。宽屏时这条路由不画目录，只画 `WorkspaceDetailPlaceholder`（同文件约 59–66 行）。
- 宽屏：`mobile/app/h/_layout.tsx` 约 66–68、114–128 行。`isWideLayout && hostId` 时左栏挂 `HostScreen embedded`，右栏是 `HostStack`。详情不是 `/h/:hostId` 时可以收起左栏；回到主机根路由会把左栏重新打开。

目录上已经有、合并后要留住的能力（无障碍名在 `mobile/src/host-screen/host-screen-header.tsx`）：

- Back to hosts：`leaveHostRoute` → `router.dismissTo('/')`（`mobile/src/host-route-exit.ts` 5–9 行）。这是回主机，不是回工作区。
- Filter / Sort / Group / Search workspaces。
- New workspace：打开 `NewWorktreeModal`。手机上另有 `NewWorkspaceFab`（`host-workspace-list.tsx` 约 196 行）。
- Accounts、Tasks、Floating Workspace。
- 分组枚举：`none`、`workspace-status`、`repo`、`pr-status`。排序枚举：`name`、`smart`、`recent`、`repo`、`manual`（`host-screen-reply-schema.ts` 9–20 行）。筛选还有 hide sleeping、hide default branch、按 repo id。

行点击进 Session：`host-workspace-list.tsx` 约 186–189 行 → `openWorktreeSession`（`use-host-worktree-actions.ts` 187–203 行）。folder workspace 没有行长按菜单。

### Session rail：当前工作区的 tab 列表

`MobileSessionSurface.tsx` 16–44 行：宽屏把 `MobileSessionRail` 钉在详情左侧；窄屏用顶栏按钮打开同一组件的遮罩。

`MobileSessionRail.tsx`：

- 102–114 行：返回，文案 “Back to worktrees”，走 `requestLeaveSession`。
- 117–124 行：一节 “Workspace”，只显示当前 `worktreeName`，不能切换别的工作区。
- 143–189 行：一节 “Sessions”，数据是 `visibleTabs`。
- 167–170 行：tab 长按打开该 tab 的 action sheet，不是直接切换 Chat/Terminal。
- 193–209 行：“New Session” 打开建 tab 的抽屉。

tab 类型定义在 `mobile-session-route-types.ts` 第 13 行：`terminal | markdown | file | browser | agent-session`。

Chat / Terminal 今天是这个 tab 的 view，不是第二条路由。切换入口在 tab 长按菜单里：`mobile-native-chat-toggle-action.ts` 10–29 行，文案是 “Switch to chat view” / “Switch to terminal view”。状态在 `use-mobile-session-view-mode.ts`：每台设备一个默认 view，再加按 tab 记住的 override。#3 要改的是这个手势的入口，本调研不动它。

## 进入 Session URL 的生产入口

目标都是 `/h/:hostId/session/:worktreeId`。

| 入口 | 位置 | 行为 |
|---|---|---|
| 工作区行 | `use-host-worktree-actions.ts` 187–203 | `worktree.activate` 后 push/replace。嵌入左栏且当前不在主机根路由时用 replace |
| 新建工作区 | `host-screen-overlays.tsx` 225–229 | `hostNewWorktreeSessionRoute`，带 `created=1`，可带 `warning` |
| 任务里新建工作区 | `use-mobile-tasks-workspace-create-actions.tsx` 269–276 | 同一 builder，然后 `router.push` |
| Floating Workspace | `floating-workspace.ts` 13–15 | 固定 id `global-floating-terminal`，不调用 `worktree.activate` |
| 首页继续卡片 | `MobileHomeScreen.tsx` 50–66 | `useOpenMobileSession`。缓存确认工作区没了则改去主机并带 notice |
| 通知 | `notification-routing.ts` 48–58 | 有 `worktreeId` 才进 Session，可带 `paneKey`；没有则只到主机 |
| Agent history resume | `MobileAgentSessionHistoryPanel.tsx` 234–238 | 先把会话排队进终端，再 push Session |
| Diff review | `MobileDiffReviewRouteScreen.tsx` 48–52 | `replace` 回同一工作区的 Session |

首页进主机本身不进 Session：`MobileHomeScreen.tsx` 79–88 行，凭证缺失去 `/pair-scan`，否则 `/h/${host.id}`。首页 “新建工作区” 去 `/h/:hostId?action=newWorktree`（约 136 行），落在目录上的新建弹层，而不是 Session。

离开方向是反的，所以两套返回不能并成一个按钮：

- 目录的 Back to hosts：`dismissTo('/')`。
- Rail / Session 顶栏的 Back to worktrees：有历史则 `back`，否则 `replace /h/:hostId`（`use-mobile-session-markdown-actions.ts` 104–111 行）。

## 同级整页：右侧不是当前 Session 的 Terminal/Chat

这些路由和 Session 平级，宽屏时出现在目录右侧，窄屏时整页替换 Session。

- Files：`/h/:hostId/files/:worktreeId`，预览再进 `/files/preview/:worktreeId`。
- Source Control：`/h/:hostId/source-control/:worktreeId`。PR 面板窄屏也进这里并带 `tab=pr`（`session-panel-host.ts` 63–74 行）。
- `/h/:hostId/pr/:worktreeId` 只是重定向到上面的 hub（`app/h/[hostId]/pr/[worktreeId].tsx`）。
- Review：`/h/:hostId/review/:worktreeId`。
- Agent history：`/h/:hostId/agent-history/:worktreeId`。这是另一份会话列表，rail 里没有它；入口在 Session 的 more 菜单（`use-mobile-session-panel-route-actions.tsx` 160–163 行）。folder / floating 工作区不提供这个动作。
- Tasks：`/h/:hostId/tasks`。目录工具栏和首页都能打开。
- Accounts：`/h/:hostId/accounts`。
- Web shell 专路由：`/h/:hostId/web`。flag 关闭时重定向回主机目录；注释写明只有深链和 Troubleshoot 会进来。
- 未匹配路径：`/h/:hostId/[...page]`，stack 标题是 “Workspace”。

宽屏且详情够宽时，Files / Source Control / PR 不 push 新路由，而是 dock 在 Session 内容旁边（`session-panel-host.ts` 45–57 行）。窄屏才 push 整页。

## 同一 URL 的两套渲染

下面这些屏幕先问 shell：桌面 bundle 认这条路由就画 `MobileWebShellScreen`，否则画原生屏幕。

- `app/h/[hostId]/index.tsx`（目录）
- `session/[worktreeId].tsx`
- `tasks.tsx`
- `files/[worktreeId].tsx` 和 `files/preview/[worktreeId].tsx`
- `source-control/[worktreeId].tsx`
- `review/[worktreeId].tsx`
- `agent-history/[worktreeId].tsx`

所以「旧目录」和「Session」各自已经有原生实现和桌面包两套入口。`web.tsx` 是第三条，只为了主动打开那个包。合并导航时如果只改原生 `HostScreen` / `MobileSessionRail`，桌面包仍会画出自己的工作区页。#8 需要写明契约覆盖哪一套；本调研不替它改验收。

## 宽屏双栏什么时候出现

`getResponsiveLayoutMetrics`（`responsive-layout-metrics.ts` 4–31 行）：`isWideLayout` 要求宽度 ≥ 700，且短边 ≥ 600。横过来的手机不会进宽屏。

`app/h/_layout.tsx` 用 `useFoldingLayout()` 的 `isWideLayout`，取的是整窗宽高，不是铰链切开后的单片宽度。`getFoldingLayoutPolicy` 只在 `isSeparating` 且铰链矩形有效时返回 `separating`；`half-opened` 不读。不分离时，宽窗仍是单块 `expanded`，外层目录和内层 rail 会一起出现。

## 交给 #8 的事实，不改它的验收

边界已经定了的部分：进移动端先选主机；进主机后目录和 Session 选择用同一条左导航；这条导航留筛选、排序、分组、搜索、新建工作区、返回主机，并在工作区下展示 Sessions；右侧只显示当前 Session 的 Terminal 或 Chat；不加 Agent 列表；不保留重复工作区页；Chat/Terminal 是 view，长按是切换；没有有效信息的折叠回退到手机布局，不做半折页。

代码和这几句话还没对齐的地方，#8 写契约时要自己定，不能从本文件直接当成已改过的验收：

1. Rail 的 “Sessions” 今天是 tab，里面有 file、browser、markdown、agent-session。边界要求右侧只有 Terminal/Chat，又要求工作区下展示 Sessions。tab 里哪些留在左导航，哪些不再是一条导航项，要由 #8 写清。
2. Tasks、Accounts、Files、Source Control、Review、Agent History、Floating Workspace 都是现成入口。边界只明确了不新增 Agent 列表、不保留重复工作区页。它们是留下、收进左导航，还是从这条导航拿掉，#8 再定。
3. 原生屏幕和桌面包是同一 URL 的两个渲染器。契约要写覆盖范围。
4. 两个返回不能合成一个：回主机是 `/`，回工作区目录是 `/h/:hostId`。合并后的左导航要同时留住这两个动作，现在它们分属两套 chrome。
5. 宽屏主机根路由的右侧是空的 placeholder，不是 Session。合并后「没选中 Session」时右侧显示什么，#8 要写。

## 验证

只读。没有跑 Android 构建，没有改生产源。

```text
git rev-parse --short HEAD
3d68889b

git status -sb
## main...origin/main
（之后仅新增本文件）

ssh -T git@github.com
Hi Nothing1024! You've successfully authenticated, but GitHub does not provide shell access.

gh issue view 7 --repo Nothing1024/orca-mobile
exit 4：gh 未登录

curl -sI https://api.github.com/repos/Nothing1024/orca-mobile/issues/7
HTTP 404（未携带有效凭据时，私有仓库表现为 404）

本机已保存的 GitHub token 请求 GET /user
HTTP 401 Bad credentials
```

定位用的是仓库内 `rg` 和直接读文件，锚点见上文路径。未创建 `tickets/` 或 `tasks.csv`。
