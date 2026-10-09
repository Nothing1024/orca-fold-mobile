import { createElement } from 'react'
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer'
import { describe, expect, it, vi } from 'vitest'
import type { MobileSessionNavSnapshot } from '../session/mobile-session-nav-bridge'
import { FLOATING_WORKSPACE_WORKTREE_ID } from '../session/floating-workspace'
import { spacing } from '../theme/mobile-theme'
import { FAB_SIZE } from '../components/NewWorkspaceFab'
import { HostWorkspaceList } from './host-workspace-list'

const harness = vi.hoisted(() => {
  const state: { nav: MobileSessionNavSnapshot | null } = { nav: null }
  return state
})

vi.mock('react-native', () => ({
  Pressable: 'Pressable',
  RefreshControl: 'RefreshControl',
  ScrollView: 'ScrollView',
  SectionList: 'SectionList',
  StyleSheet: { create: <T,>(styles: T) => styles },
  Text: 'Text',
  View: 'View'
}))
vi.mock('lucide-react-native', () => ({
  ChevronDown: 'ChevronDown',
  ChevronRight: 'ChevronRight',
  Pin: 'Pin',
  X: 'X'
}))
vi.mock('../components/AuthFailedBanner', () => ({ AuthFailedBanner: 'AuthFailedBanner' }))
vi.mock('../components/HostDiagnosticsLink', () => ({ HostDiagnosticsLink: 'HostDiagnosticsLink' }))
vi.mock('../components/MobileRepoIcon', () => ({ MobileRepoIcon: 'MobileRepoIcon' }))
vi.mock('../components/MobileSearchField', () => ({ MobileSearchField: 'MobileSearchField' }))
vi.mock('../components/NewWorkspaceFab', () => ({
  NewWorkspaceFab: 'NewWorkspaceFab',
  FAB_SIZE: 56
}))
vi.mock('../components/WorktreeListRow', () => ({ WorktreeListRow: 'WorktreeListRow' }))
vi.mock('./HostSidebarWorkspaceRow', () => ({
  HostSidebarWorkspaceRow: 'HostSidebarWorkspaceRow'
}))
vi.mock('./HostWorkspaceSessions', () => ({ HostWorkspaceSessions: 'HostWorkspaceSessions' }))
vi.mock('./HostSidebarWorkspacesHeader', () => ({
  HostSidebarWorkspacesHeader: 'HostSidebarWorkspacesHeader'
}))
vi.mock('./HostSidebarWorkspaceTools', () => ({
  HostSidebarWorkspaceTools: 'HostSidebarWorkspaceTools'
}))
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 48, left: 0 })
}))
vi.mock('../session/mobile-session-nav-bridge', async () => {
  const actual = await vi.importActual<typeof import('../session/mobile-session-nav-bridge')>(
    '../session/mobile-session-nav-bridge'
  )
  return {
    ...actual,
    useMobileSessionNav: () => harness.nav
  }
})
vi.mock('../worktree/host-workspace-list-states', () => ({
  HostWorkspaceListStates: 'HostWorkspaceListStates'
}))

function navFor(worktreeId: string): MobileSessionNavSnapshot {
  return {
    hostId: 'host-1',
    worktreeId,
    activeTabId: null,
    tabs: [],
    createDisabled: false,
    showFiles: false,
    showSourceControl: false,
    showMore: false,
    activePanel: null,
    switchTab: () => {},
    openTabMenu: () => {},
    createSession: () => {},
    openQuickCommands: () => {},
    openFiles: () => {},
    openSourceControl: () => {},
    openPr: () => {},
    openMore: () => {},
    activeTabView: 'terminal'
  }
}

function worktree(worktreeId: string, repo: string) {
  return {
    worktreeId,
    repo,
    repoId: repo,
    branch: 'main',
    displayName: repo,
    path: `/${repo}`,
    workspaceKind: 'git' as const,
    isPinned: false,
    liveTerminalCount: 0,
    hasAttachedPty: false,
    preview: '',
    unread: false,
    linkedPR: null
  }
}

function listWith(fields: {
  embedded: boolean
  sections: { key: string; title: string; data: ReturnType<typeof worktree>[] }[]
  displayWorktrees: ReturnType<typeof worktree>[]
  groupMode?: string
}) {
  const controller = {
    actions: {
      openWorktreeSession: () => {},
      openNewWorktreeModal: () => {},
      onWorkspaceActivated: () => {}
    },
    activeWorktreeScroll: { sectionListRef: { current: null }, onScrollToIndexFailed: () => {} },
    catalog: { refreshing: false, onRefresh: () => {} },
    connState: 'connected',
    contentMaxWidth: 600,
    displayWorktrees: fields.displayWorktrees,
    embedded: fields.embedded,
    forceReconnectHost: () => {},
    hostId: 'host-1',
    insets: { bottom: 0 },
    isReadOnly: false,
    isWideLayout: false,
    noticeParam: undefined,
    now: 0,
    reconnectAttempts: 0,
    relayRecovery: { pairingRejected: false },
    routeNotice: '',
    router: { push: () => {} },
    sectionsResult: {
      rawSections: fields.sections,
      sections: fields.sections,
      uniqueRepoColors: new Map()
    },
    setDismissedNotice: () => {},
    settings: {
      activeFilterCount: 0,
      toggleCollapsed: () => {},
      toggleWorktreeLineage: () => {}
    },
    state: {
      actionError: '',
      setActionError: () => {},
      catalogError: null,
      collapsedGroups: new Set(),
      groupMode: fields.groupMode ?? 'none',
      pinnedIds: new Set(),
      repoIconsByName: new Map(),
      search: '',
      setSearch: () => {},
      showSearch: false,
      worktreesLoaded: true,
      setActionTarget: () => {},
      setConfirmRemoveHost: () => {}
    }
  }
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: the list reads only the fields this harness sets; session and directory children are mocked to host strings.
  return { controller } as unknown as Parameters<typeof HostWorkspaceList>[0]
}

function renderList(fields: Parameters<typeof listWith>[0]): ReactTestRenderer {
  const rendered: { tree: ReactTestRenderer | null } = { tree: null }
  act(() => {
    rendered.tree = create(createElement(HostWorkspaceList, listWith(fields)))
  })
  if (rendered.tree === null) {
    throw new Error('the list did not render')
  }
  return rendered.tree
}

function typeName(type: unknown): string {
  if (typeof type === 'string') {
    return type
  }
  if (typeof type === 'function' && typeof type.name === 'string') {
    return type.name
  }
  return ''
}

function named(tree: ReactTestRenderer, name: string): ReactTestInstance[] {
  return tree.root.findAll((node) => typeName(node.type) === name)
}

function ancestorNames(node: ReactTestInstance): string[] {
  const names: string[] = []
  let current = node.parent
  while (current != null) {
    names.push(typeName(current.type))
    current = current.parent
  }
  return names
}

function childNames(node: ReactTestInstance): string[] {
  return node.children.flatMap((child) => (typeof child === 'string' ? [] : [typeName(child.type)]))
}

function region(tree: ReactTestRenderer, label: string): ReactTestInstance {
  const node = named(tree, 'View').find((candidate) => candidate.props.accessibilityLabel === label)
  if (node === undefined) {
    throw new Error(`expected the ${label} region`)
  }
  return node
}

function rowOf(list: ReactTestInstance, item: ReturnType<typeof worktree>): ReactTestRenderer {
  const element = list.props.renderItem({ item, index: 0, separators: {} })
  const rendered: { tree: ReactTestRenderer | null } = { tree: null }
  act(() => {
    rendered.tree = create(element)
  })
  if (rendered.tree === null) {
    throw new Error('the row did not render')
  }
  return rendered.tree
}

function sessionCount(tree: ReactTestRenderer): number {
  return named(tree, 'HostWorkspaceSessions').length
}

const selected = worktree('wt-a', 'narwhal')
const following = worktree('wt-b', 'otter')
const sections = [{ key: 'all', title: '', data: [selected, following] }]

describe('embedded sidebar splits worktrees and sessions', () => {
  it('keeps the selected worktree row free of sessions and scrolls them in the lower pane', () => {
    harness.nav = navFor('wt-a')
    const tree = renderList({
      embedded: true,
      sections,
      displayWorktrees: [selected, following]
    })
    const [list, ...extraLists] = named(tree, 'SectionList')
    expect(extraLists).toEqual([])
    if (list === undefined) {
      throw new Error('expected a worktree list')
    }
    const selectedRow = rowOf(list, selected)
    const followingRow = rowOf(list, following)
    expect(sessionCount(selectedRow)).toBe(0)
    expect(sessionCount(followingRow)).toBe(0)
    expect(named(selectedRow, 'HostSidebarWorkspaceRow')).toHaveLength(1)
    expect(named(followingRow, 'HostSidebarWorkspaceRow')).toHaveLength(1)
    expect(named(selectedRow, 'WorktreeListRow')).toHaveLength(0)

    const [sessions, ...extraSessions] = named(tree, 'HostWorkspaceSessions')
    expect(extraSessions).toEqual([])
    if (sessions === undefined) {
      throw new Error('expected the lower session pane')
    }
    expect(sessions.props.nav).toBe(harness.nav)
    const ancestors = ancestorNames(sessions)
    expect(ancestors).toContain('ScrollView')
    expect(ancestors).not.toContain('SectionList')
    expect(ancestors).not.toContain('WorktreeListRow')

    const [pane] = named(tree, 'ScrollView')
    expect(pane?.props.style?.maxHeight).toBeUndefined()
    expect(pane?.props.style?.height).toBeUndefined()
    expect(list.props.style).toMatchObject({ flexGrow: 1, flexShrink: 1, minHeight: 0 })
    expect(list.props.ListFooterComponent ?? null).toBeNull()
    expect(list.props.contentContainerStyle[1]).toEqual({ paddingBottom: spacing.lg })

    const column = tree.root.findAll(
      (node) =>
        typeName(node.type) === 'View' &&
        node.props.style?.flex === 1 &&
        node.props.style?.minHeight === 0
    )
    expect(column).toHaveLength(1)
    const regions = column[0] ? childNames(column[0]) : []
    expect(regions).toEqual(['View', 'View', 'View'])
    const [workspacesRegion, sessionsRegion, toolsRegion] = column[0]?.props.children ?? []
    expect(workspacesRegion?.props.accessibilityLabel).toBe('Workspaces')
    expect(workspacesRegion?.props.style).toMatchObject({
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      maxHeight: '50%',
      minHeight: 132
    })
    expect(sessionsRegion?.props.accessibilityLabel).toBe('Sessions')
    expect(sessionsRegion?.props.style).toMatchObject({
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minHeight: 0
    })
    expect(toolsRegion?.props.accessibilityLabel).toBe('Workspace tools')
    expect(toolsRegion?.props.style).toEqual([
      expect.objectContaining({ flexShrink: 0 }),
      { paddingBottom: 48 }
    ])

    const workspaceNames = childNames(region(tree, 'Workspaces'))
    expect(workspaceNames.indexOf('HostSidebarWorkspacesHeader')).toBeGreaterThanOrEqual(0)
    expect(workspaceNames.indexOf('HostWorktreeSectionList')).toBeGreaterThan(
      workspaceNames.indexOf('HostSidebarWorkspacesHeader')
    )
    expect(workspaceNames).not.toContain('ScrollView')
    expect(workspaceNames).not.toContain('HostSidebarListToolbar')

    expect(childNames(region(tree, 'Sessions'))).toEqual(['ScrollView'])
    expect(childNames(region(tree, 'Workspace tools'))).toEqual(['HostSidebarWorkspaceTools'])

    expect(named(tree, 'HostSidebarWorkspacesHeader')).toHaveLength(1)
    expect(named(tree, 'HostSidebarListToolbar')).toEqual([])
    expect(named(tree, 'HostSidebarBottomBar')).toEqual([])
    expect(named(tree, 'NewWorkspaceFab')).toEqual([])
  })

  it('keeps a filtered-out workspace in the lower pane, including a detached floating title', () => {
    harness.nav = navFor(FLOATING_WORKSPACE_WORKTREE_ID)
    const tree = renderList({
      embedded: true,
      sections,
      displayWorktrees: [selected, following]
    })
    const [list] = named(tree, 'SectionList')
    if (list === undefined) {
      throw new Error('expected a worktree list')
    }
    expect(sessionCount(rowOf(list, selected))).toBe(0)
    const [sessions] = named(tree, 'HostWorkspaceSessions')
    if (sessions === undefined) {
      throw new Error('expected detached sessions')
    }
    expect(sessions.props.nav.worktreeId).toBe(FLOATING_WORKSPACE_WORKTREE_ID)
    expect(ancestorNames(sessions).filter((name) => name === 'ScrollView')).toEqual(['ScrollView'])
    expect(named(tree, 'Text').map((node) => node.props.children)).toContain('Floating Workspace')
    expect(named(tree, 'HostSidebarWorkspacesHeader')).toHaveLength(1)
    expect(named(tree, 'HostSidebarBottomBar')).toEqual([])
  })

  it('drops the All and repo headers on the wide sidebar and keeps them on the phone', () => {
    const all = [{ key: 'all', title: 'All', data: [selected, following] }]
    const header = (tree: ReactTestRenderer) => {
      const [list] = named(tree, 'SectionList')
      if (list === undefined) {
        throw new Error('expected a worktree list')
      }
      const rendered = list.props.renderSectionHeader({ section: all[0] })
      return rendered?.props.accessibilityLabel ?? null
    }
    const wide = renderList({
      embedded: true,
      sections: all,
      displayWorktrees: [selected, following]
    })
    expect(header(wide)).toBeNull()
    const phone = renderList({
      embedded: false,
      sections: all,
      displayWorktrees: [selected, following]
    })
    expect(header(phone)).toBe('All')

    const repo = [{ key: 'repo:orca', title: 'orca', data: [selected, following] }]
    const repoHeader = (tree: ReactTestRenderer) => {
      const [list] = named(tree, 'SectionList')
      if (list === undefined) {
        throw new Error('expected a worktree list')
      }
      const rendered = list.props.renderSectionHeader({ section: repo[0] })
      return rendered?.props.accessibilityLabel ?? null
    }
    const wideRepo = renderList({
      embedded: true,
      sections: repo,
      displayWorktrees: [selected, following],
      groupMode: 'repo'
    })
    expect(repoHeader(wideRepo)).toBeNull()
    const phoneRepo = renderList({
      embedded: false,
      sections: repo,
      displayWorktrees: [selected, following],
      groupMode: 'repo'
    })
    expect(repoHeader(phoneRepo)).toBe('orca')
  })

  it('leaves the phone page nesting sessions under the selected row, with the floating button', () => {
    harness.nav = navFor('wt-a')
    const tree = renderList({
      embedded: false,
      sections,
      displayWorktrees: [selected, following]
    })
    expect(named(tree, 'ScrollView')).toEqual([])
    expect(named(tree, 'HostSidebarListToolbar')).toEqual([])
    expect(named(tree, 'HostSidebarBottomBar')).toEqual([])
    expect(named(tree, 'HostSidebarBottomActions')).toEqual([])
    expect(sessionCount(tree)).toBe(0)
    expect(named(tree, 'NewWorkspaceFab')).toHaveLength(1)

    const [list] = named(tree, 'SectionList')
    if (list === undefined) {
      throw new Error('expected a worktree list')
    }
    expect(list.props.style ?? null).toBeNull()
    expect(list.props.contentContainerStyle[1]).toEqual({
      paddingBottom: FAB_SIZE + spacing.xl
    })
    expect(sessionCount(rowOf(list, selected))).toBe(1)
    expect(sessionCount(rowOf(list, following))).toBe(0)
    expect(named(rowOf(list, selected), 'WorktreeListRow')).toHaveLength(1)
    expect(named(rowOf(list, selected), 'HostSidebarWorkspaceRow')).toHaveLength(0)
  })
})
