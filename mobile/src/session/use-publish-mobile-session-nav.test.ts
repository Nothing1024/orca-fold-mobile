import { createElement } from 'react'
import { act, create } from 'react-test-renderer'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { publishMobileSessionNav, readMobileSessionNav } from './mobile-session-nav-bridge'
import type { MobileSessionTab } from './mobile-session-route-types'
import type { MobileSessionController } from './use-mobile-session-controller'
import { usePublishMobileSessionNav } from './use-publish-mobile-session-nav'

function terminal(terminalHandle: string | null): MobileSessionTab {
  return {
    type: 'terminal',
    id: 't1',
    title: 'Shell',
    terminal: terminalHandle,
    status: terminalHandle ? 'ready' : 'pending-handle',
    isActive: true
  }
}

function controllerWith(tab: MobileSessionTab): MobileSessionController {
  const controller = {
    hostId: 'host-1',
    worktreeId: 'wt-1',
    worktreeName: 'narwhal-2',
    activeSessionTabId: 't1',
    connState: 'connected',
    activePanel: null,
    creating: false,
    creatingBrowser: false,
    creatingMarkdown: false,
    isFolderWorkspaceRoute: false,
    isFloatingWorkspaceRoute: false,
    quickCommandsSupported: false,
    showHeaderMoreButton: false,
    showNativeChat: false,
    visibleTabs: [tab],
    switchSessionTab: vi.fn(),
    openSessionTabActionSheetAfterKeyboardDismiss: vi.fn(),
    setCreateError: vi.fn(),
    setShowCreateTabDrawer: vi.fn(),
    setShowQuickCommands: vi.fn(),
    showToast: vi.fn(),
    handlePanelTap: vi.fn(),
    setShowHeaderMoreActions: vi.fn()
  }
  // SAFETY: the publisher reads only the fields above. A call to any other throws.
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: stated above.
  return controller as unknown as MobileSessionController
}

function Probe({ controller }: { controller: MobileSessionController }) {
  usePublishMobileSessionNav(controller)
  return null
}

beforeEach(() => {
  publishMobileSessionNav(null)
})

describe('usePublishMobileSessionNav', () => {
  it('publishes the open session and clears it on unmount', () => {
    const controller = controllerWith(terminal(null))
    let renderer: ReturnType<typeof create> | undefined
    act(() => {
      renderer = create(createElement(Probe, { controller }))
    })
    expect(readMobileSessionNav()?.tabs.map((tab) => tab.id)).toEqual(['t1'])
    expect(readMobileSessionNav()?.workspaceName).toBe('narwhal-2')
    act(() => {
      renderer?.unmount()
    })
    expect(readMobileSessionNav()).toBeNull()
  })

  it('switches using the current terminal handle, not the tab object the list captured', () => {
    const stale = terminal(null)
    const controller = controllerWith(stale)
    act(() => {
      create(createElement(Probe, { controller }))
    })
    const fresh = terminal('pty-1')
    controller.visibleTabs = [fresh]
    readMobileSessionNav()?.switchTab(stale)
    expect(controller.switchSessionTab).toHaveBeenCalledWith(fresh)
  })
})
