import { describe, expect, it, vi } from 'vitest'
import {
  publishMobileSessionNav,
  readMobileSessionNav,
  sessionNavMatchesWorktree,
  subscribeMobileSessionNav,
  type MobileSessionNavSnapshot
} from './mobile-session-nav-bridge'

function snapshot(worktreeId: string): MobileSessionNavSnapshot {
  return {
    hostId: 'host-1',
    worktreeId,
    activeTabId: 'tab-1',
    tabs: [],
    createDisabled: false,
    showFiles: true,
    showSourceControl: true,
    showMore: false,
    activePanel: null,
    switchTab: () => {},
    openTabMenu: () => {},
    createSession: () => {},
    openQuickCommands: () => {},
    openFiles: () => {},
    openSourceControl: () => {},
    openMore: () => {}
  }
}

describe('mobile session nav bridge', () => {
  it('starts empty and replaces the snapshot listeners read', () => {
    publishMobileSessionNav(null)
    expect(readMobileSessionNav()).toBeNull()
    const next = snapshot('wt-1')
    const heard = vi.fn()
    const unsubscribe = subscribeMobileSessionNav(heard)
    publishMobileSessionNav(next)
    expect(readMobileSessionNav()).toBe(next)
    expect(heard).toHaveBeenCalledTimes(1)
    unsubscribe()
    publishMobileSessionNav(null)
    expect(heard).toHaveBeenCalledTimes(1)
    expect(readMobileSessionNav()).toBeNull()
  })

  it('matches only the host and worktree the session published', () => {
    const nav = snapshot('wt-1')
    expect(sessionNavMatchesWorktree(nav, 'host-1', 'wt-1')).toBe(true)
    expect(sessionNavMatchesWorktree(nav, 'host-1', 'wt-2')).toBe(false)
    expect(sessionNavMatchesWorktree(nav, 'host-2', 'wt-1')).toBe(false)
    expect(sessionNavMatchesWorktree(nav, undefined, 'wt-1')).toBe(false)
    expect(sessionNavMatchesWorktree(null, 'host-1', 'wt-1')).toBe(false)
  })
})
