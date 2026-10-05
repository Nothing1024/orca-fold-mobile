import { useSyncExternalStore } from 'react'
import type { ActivePanel } from './session-panel-host'
import type { MobileSessionTab } from './mobile-session-route-types'

/** What the one left nav needs from the open session. The session screen publishes it;
 *  the host workspace list renders it. No second copy of the selection lives here. */
export type MobileSessionNavSnapshot = {
  hostId: string
  worktreeId: string
  activeTabId: string | null
  tabs: readonly MobileSessionTab[]
  createDisabled: boolean
  showFiles: boolean
  showSourceControl: boolean
  showMore: boolean
  activePanel: ActivePanel
  switchTab: (tab: MobileSessionTab) => void
  openTabMenu: (tab: MobileSessionTab) => void
  createSession: () => void
  openQuickCommands: () => void
  openFiles: () => void
  openSourceControl: () => void
  openMore: () => void
}

type Listener = () => void

let snapshot: MobileSessionNavSnapshot | null = null
const listeners = new Set<Listener>()

export function publishMobileSessionNav(next: MobileSessionNavSnapshot | null): void {
  snapshot = next
  for (const listener of listeners) {
    listener()
  }
}

export function readMobileSessionNav(): MobileSessionNavSnapshot | null {
  return snapshot
}

export function subscribeMobileSessionNav(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useMobileSessionNav(): MobileSessionNavSnapshot | null {
  return useSyncExternalStore(subscribeMobileSessionNav, readMobileSessionNav, readMobileSessionNav)
}

export function sessionNavMatchesWorktree(
  nav: MobileSessionNavSnapshot | null,
  hostId: string | undefined,
  worktreeId: string
): nav is MobileSessionNavSnapshot {
  return nav != null && hostId != null && nav.hostId === hostId && nav.worktreeId === worktreeId
}
