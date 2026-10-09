import { createElement } from 'react'
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer'
import { describe, expect, it, vi } from 'vitest'
import type { MobileGroupMode } from '../worktree/workspace-view-settings'
import { HostScreenHeader } from './host-screen-header'
import { HostSidebarWorkspacesHeader } from './HostSidebarWorkspacesHeader'
import type { HostScreenController } from './use-host-screen-controller'

vi.mock('react-native', () => ({
  Pressable: 'Pressable',
  StyleSheet: { create: (styles: unknown) => styles, hairlineWidth: 1 },
  Text: 'Text',
  View: 'View'
}))
vi.mock('lucide-react-native', () => ({
  ChevronLeft: 'ChevronLeft',
  Filter: 'Filter',
  Layers: 'Layers',
  List: 'List',
  MoreHorizontal: 'MoreHorizontal',
  PanelLeftClose: 'PanelLeftClose',
  Plus: 'Plus',
  Search: 'Search',
  SlidersHorizontal: 'SlidersHorizontal',
  SquareTerminal: 'SquareTerminal',
  UserCircle: 'UserCircle',
  X: 'X'
}))
vi.mock('../components/StatusDot', () => ({ StatusDot: 'StatusDot' }))

const SCROLL = new Set(['ScrollView', 'SectionList', 'FlatList'])

type Probe = {
  controller: HostScreenController
  navigateFromHostList: ReturnType<typeof vi.fn>
  openNewWorktreeModal: ReturnType<typeof vi.fn>
  openFloatingWorkspace: ReturnType<typeof vi.fn>
  setShowFilterModal: ReturnType<typeof vi.fn>
  setShowSortPicker: ReturnType<typeof vi.fn>
  setShowGroupPicker: ReturnType<typeof vi.fn>
  setShowSearch: ReturnType<typeof vi.fn>
}

const WORKTREE_COUNT = 4

function probe(overrides?: {
  connState?: 'connected' | 'reconnecting'
  activeFilterCount?: number
  floatingWorkspaceEnabled?: boolean
  showSearch?: boolean
  selectedSortLabel?: string
  groupMode?: MobileGroupMode
  bottomInset?: number
}): Probe {
  const navigateFromHostList = vi.fn()
  const openNewWorktreeModal = vi.fn()
  const openFloatingWorkspace = vi.fn()
  const setShowFilterModal = vi.fn()
  const setShowSortPicker = vi.fn()
  const setShowGroupPicker = vi.fn()
  const setShowSearch = vi.fn()
  const fields = {
    actions: {
      leaveHost: vi.fn(),
      navigateFromHostList,
      openNewWorktreeModal,
      openFloatingWorkspace
    },
    connState: overrides?.connState ?? 'connected',
    embedded: true,
    floatingWorkspaceEnabled: overrides?.floatingWorkspaceEnabled ?? true,
    forceReconnectHost: null,
    hostDisplay: { title: 'Desk' },
    displayWorktrees: Array.from({ length: WORKTREE_COUNT }, (_, index) => index),
    hostId: 'host-1',
    lastConnectedAt: null,
    onHideSidebar: undefined,
    reconnectAttempts: 0,
    relayRecovery: {},
    insets: { top: 0, right: 0, bottom: overrides?.bottomInset ?? 12, left: 0 },
    settings: {
      activeFilterCount: overrides?.activeFilterCount ?? 0,
      selectedSortLabel: overrides?.selectedSortLabel ?? 'Recent'
    },
    state: {
      groupMode: overrides?.groupMode ?? 'none',
      hostName: 'Desk',
      setShowFilterModal,
      setShowGroupPicker,
      setShowSearch,
      setShowSortPicker,
      showSearch: overrides?.showSearch ?? false
    }
  }
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: these rows read only actions, connection, filter/sort/group/search state, the floating-workspace gate, host id, and the bottom inset.
  const controller = fields as unknown as HostScreenController
  return {
    controller,
    navigateFromHostList,
    openNewWorktreeModal,
    openFloatingWorkspace,
    setShowFilterModal,
    setShowSortPicker,
    setShowGroupPicker,
    setShowSearch
  }
}

function render(node: React.ReactElement): ReactTestRenderer {
  const rendered: { tree: ReactTestRenderer | null } = { tree: null }
  act(() => {
    rendered.tree = create(node)
  })
  if (rendered.tree === null) {
    throw new Error('the row did not render')
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

function pressables(tree: ReactTestRenderer): ReactTestInstance[] {
  return tree.root.findAll((node) => typeName(node.type) === 'Pressable')
}

function texts(tree: ReactTestRenderer): ReactTestInstance[] {
  return tree.root.findAll((node) => typeName(node.type) === 'Text')
}

function textCount(node: ReactTestInstance): number {
  return node.findAll((child) => typeName(child.type) === 'Text').length
}

function labels(tree: ReactTestRenderer): string[] {
  return pressables(tree).map((node) => String(node.props.accessibilityLabel))
}

function byLabel(tree: ReactTestRenderer, label: string): ReactTestInstance {
  const matches = pressables(tree).filter((node) => node.props.accessibilityLabel === label)
  expect(matches).toHaveLength(1)
  const match = matches[0]
  if (match === undefined) {
    throw new Error(`missing ${label}`)
  }
  return match
}

function isPressStyle(style: unknown): style is (state: { pressed: boolean }) => unknown {
  return typeof style === 'function'
}

function resolvedStyle(style: unknown): Record<string, unknown> {
  const value = isPressStyle(style) ? style({ pressed: false }) : style
  const parts = Array.isArray(value) ? value : [value]
  const flat: Record<string, unknown> = {}
  for (const part of parts) {
    if (part !== null && typeof part === 'object') {
      Object.assign(flat, part)
    }
  }
  return flat
}

function ancestorTypes(node: ReactTestInstance): string[] {
  const names: string[] = []
  let parent = node.parent
  while (parent !== null) {
    names.push(typeName(parent.type))
    parent = parent.parent
  }
  return names
}

function touchHeight(node: ReactTestInstance): number {
  const style = resolvedStyle(node.props.style)
  const height = typeof style.minHeight === 'number' ? style.minHeight : Number(style.height ?? 0)
  const slop = typeof node.props.hitSlop === 'number' ? node.props.hitSlop * 2 : 0
  return height + slop
}

function assertNamedTouchTargets(tree: ReactTestRenderer) {
  const nodes = pressables(tree)
  expect(nodes.length).toBeGreaterThan(0)
  for (const node of nodes) {
    expect(node.props.accessibilityRole).toBe('button')
    expect(typeof node.props.accessibilityLabel).toBe('string')
    expect(String(node.props.accessibilityLabel).length).toBeGreaterThan(0)
    expect(touchHeight(node)).toBeGreaterThanOrEqual(44)
    expect(ancestorTypes(node).some((name) => SCROLL.has(name))).toBe(false)
  }
  const iconOnly = nodes.filter((node) => textCount(node) === 0)
  expect(iconOnly.length).toBeGreaterThan(0)
  expect(iconOnly.every((node) => String(node.props.accessibilityLabel).length > 0)).toBe(true)
}

describe('wide sidebar directory actions sit on the title row and the host menu', () => {
  it('puts search, the filter menu, and new workspace on the title row', () => {
    const row = probe({ activeFilterCount: 3, groupMode: 'repo', selectedSortLabel: 'Recent' })
    const tree = render(createElement(HostSidebarWorkspacesHeader, { controller: row.controller }))
    expect(labels(tree)).toEqual([
      'Search workspaces',
      'Filter, sort, and group, 3 active',
      'New workspace'
    ])
    expect(texts(tree).map((node) => node.props.children)).toEqual(['WORKSPACES', 4, 3])
    expect(tree.root.findAll((node) => SCROLL.has(typeName(node.type)))).toEqual([])
    assertNamedTouchTargets(tree)
    expect(
      pressables(tree)
        .filter((node) => textCount(node) === 0)
        .map((node) => node.props.accessibilityLabel)
    ).toEqual(['Search workspaces', 'New workspace'])

    act(() => {
      byLabel(tree, 'Search workspaces').props.onPress()
      byLabel(tree, 'Filter, sort, and group, 3 active').props.onPress()
    })
    expect(labels(tree)).toEqual([
      'Search workspaces',
      'Filter, sort, and group, 3 active',
      'New workspace',
      'Filter workspaces, 3 active',
      'Sort by Recent',
      'Group workspaces'
    ])
    act(() => {
      byLabel(tree, 'Filter workspaces, 3 active').props.onPress()
      byLabel(tree, 'Sort by Recent').props.onPress()
      byLabel(tree, 'Group workspaces').props.onPress()
      byLabel(tree, 'New workspace').props.onPress()
    })
    const toggle = row.setShowSearch.mock.calls[0]?.[0]
    if (typeof toggle !== 'function') {
      throw new Error('search did not toggle')
    }
    expect(toggle(false)).toBe(true)
    expect(row.setShowFilterModal).toHaveBeenCalledWith(true)
    expect(row.setShowSortPicker).toHaveBeenCalledWith(true)
    expect(row.setShowGroupPicker).toHaveBeenCalledWith(true)
    expect(row.openNewWorktreeModal).toHaveBeenCalledTimes(1)
  })

  it('hides the filter badge when nothing is active and renames search while it is open', () => {
    const idle = probe({ activeFilterCount: 0, showSearch: false })
    const idleTree = render(
      createElement(HostSidebarWorkspacesHeader, { controller: idle.controller })
    )
    expect(labels(idleTree)).toContain('Filter, sort, and group')
    expect(
      byLabel(idleTree, 'Filter, sort, and group').findAll((node) => typeName(node.type) === 'Text')
    ).toEqual([])

    const open = probe({ showSearch: true, groupMode: 'workspaceStatus' })
    const openTree = render(
      createElement(HostSidebarWorkspacesHeader, { controller: open.controller })
    )
    expect(labels(openTree)[0]).toBe('Close search')
  })

  it('opens Accounts, Tasks, and Floating Workspace from the host menu', () => {
    const row = probe()
    const tree = render(createElement(HostScreenHeader, { controller: row.controller }))
    expect(labels(tree)).not.toContain('Accounts')
    act(() => {
      byLabel(tree, 'Host menu').props.onPress()
    })
    expect(labels(tree)).toEqual(
      expect.arrayContaining(['Accounts', 'Tasks', 'Floating Workspace'])
    )
    assertNamedTouchTargets(tree)
    act(() => {
      byLabel(tree, 'Accounts').props.onPress()
      byLabel(tree, 'Tasks').props.onPress()
      byLabel(tree, 'Floating Workspace').props.onPress()
    })
    expect(row.navigateFromHostList.mock.calls).toEqual([
      ['/h/host-1/accounts'],
      ['/h/host-1/tasks']
    ])
    expect(row.openFloatingWorkspace).toHaveBeenCalledTimes(1)
  })

  it('disables New workspace and the host menu entries while disconnected', () => {
    const row = probe({ connState: 'reconnecting', activeFilterCount: 2 })
    const header = render(createElement(HostScreenHeader, { controller: row.controller }))
    act(() => {
      byLabel(header, 'Host menu').props.onPress()
    })
    for (const label of ['Accounts', 'Tasks', 'Floating Workspace']) {
      expect(byLabel(header, label).props.disabled).toBe(true)
    }
    expect(resolvedStyle(byLabel(header, 'Accounts').props.style).opacity).toBe(0.6)

    const tools = render(createElement(HostSidebarWorkspacesHeader, { controller: row.controller }))
    expect(byLabel(tools, 'New workspace').props.disabled).toBe(true)
    expect(resolvedStyle(byLabel(tools, 'New workspace').props.style).opacity).toBe(0.6)
    expect(byLabel(tools, 'Search workspaces').props.disabled).toBeFalsy()
    act(() => {
      byLabel(tools, 'Filter, sort, and group, 2 active').props.onPress()
    })
    act(() => {
      byLabel(tools, 'Filter workspaces, 2 active').props.onPress()
    })
    expect(row.setShowFilterModal).toHaveBeenCalledWith(true)
  })

  it('omits Floating Workspace when it is unavailable', () => {
    const row = probe({ floatingWorkspaceEnabled: false })
    const tree = render(createElement(HostScreenHeader, { controller: row.controller }))
    act(() => {
      byLabel(tree, 'Host menu').props.onPress()
    })
    expect(labels(tree)).toEqual(expect.arrayContaining(['Accounts', 'Tasks']))
    expect(labels(tree)).not.toContain('Floating Workspace')
  })

  it('keeps the title row and the host menu out of a scrolling list', () => {
    const row = probe({ activeFilterCount: 1 })
    const trees = [HostSidebarWorkspacesHeader, HostScreenHeader].map((part) =>
      render(createElement(part, { controller: row.controller }))
    )
    for (const tree of trees) {
      expect(tree.root.findAll((node) => SCROLL.has(typeName(node.type)))).toEqual([])
    }
  })
})
