import { useEffect, useRef } from 'react'
import { getMobileSessionTabTitle } from './mobile-terminal-tab-agent'
import { publishMobileSessionNav, type MobileSessionNavSnapshot } from './mobile-session-nav-bridge'
import type { MobileSessionTab } from './mobile-session-route-types'
import type { MobileSessionController } from './use-mobile-session-controller'

function tabSignature(tab: MobileSessionTab): string {
  const title = getMobileSessionTabTitle(tab)
  if (tab.type === 'terminal') {
    const handle = `${tab.status ?? ''}\t${tab.terminal ?? ''}\t${tab.launchAgent ?? ''}`
    return `${tab.id}\tterminal\t${title}\t${handle}`
  }
  if (tab.type === 'agent-session') {
    return `${tab.id}\tagent-session\t${title}\t${tab.agent}`
  }
  return `${tab.id}\t${tab.type}\t${title}`
}

function navSignature(controller: MobileSessionController): string {
  const tabs = controller.visibleTabs.map(tabSignature).join('\n')
  return [
    controller.hostId,
    controller.worktreeId,
    controller.activeSessionTabId ?? '',
    controller.connState,
    controller.activePanel ?? '',
    controller.creating,
    controller.creatingBrowser,
    controller.creatingMarkdown,
    controller.isFolderWorkspaceRoute,
    controller.isFloatingWorkspaceRoute,
    controller.quickCommandsSupported,
    controller.showHeaderMoreButton,
    tabs
  ].join('\u0000')
}

function snapshotFrom(read: () => MobileSessionController): MobileSessionNavSnapshot {
  const controller = read()
  const createDisabled =
    controller.creating ||
    controller.creatingBrowser ||
    controller.creatingMarkdown ||
    controller.connState !== 'connected'
  return {
    hostId: controller.hostId,
    worktreeId: controller.worktreeId,
    activeTabId: controller.activeSessionTabId,
    tabs: controller.visibleTabs,
    createDisabled,
    showFiles: !controller.isFloatingWorkspaceRoute,
    showSourceControl: !controller.isFolderWorkspaceRoute && !controller.isFloatingWorkspaceRoute,
    showMore: controller.showHeaderMoreButton,
    activePanel: controller.activePanel,
    switchTab: (tab) => {
      const current = read()
      current.switchSessionTab(current.visibleTabs.find((item) => item.id === tab.id) ?? tab)
    },
    openTabMenu: (tab) => {
      const current = read()
      current.openSessionTabActionSheetAfterKeyboardDismiss(
        current.visibleTabs.find((item) => item.id === tab.id) ?? tab
      )
    },
    createSession: () => {
      const current = read()
      current.setCreateError('')
      current.setShowCreateTabDrawer(true)
    },
    openQuickCommands: () => {
      const current = read()
      if (current.quickCommandsSupported === true) {
        current.setShowQuickCommands(true)
        return
      }
      current.showToast(
        current.quickCommandsSupported === false
          ? 'Desktop update required for quick commands'
          : 'Checking desktop capabilities — try again in a moment',
        1600
      )
    },
    openFiles: () => read().handlePanelTap('files'),
    openSourceControl: () => read().handlePanelTap('sourceControl'),
    openMore: () => read().setShowHeaderMoreActions(true)
  }
}

/** Publishes the open session into the host nav. Cleared on unmount so a closed
 *  session cannot leave a selectable tab behind. */
export function usePublishMobileSessionNav(controller: MobileSessionController): void {
  const controllerRef = useRef(controller)
  controllerRef.current = controller
  const signature = navSignature(controller)
  useEffect(() => {
    publishMobileSessionNav(snapshotFrom(() => controllerRef.current))
  }, [signature])
  useEffect(() => () => publishMobileSessionNav(null), [])
}
