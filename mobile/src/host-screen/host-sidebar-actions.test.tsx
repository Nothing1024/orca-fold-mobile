import { createElement } from 'react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer'
import { describe, expect, it, vi } from 'vitest'
import { colors } from '../theme/mobile-theme'
import type { MobileGroupMode } from '../worktree/workspace-view-settings'
import { HostSidebarBottomBar } from './HostSidebarBottomBar'
import { HostSidebarBottomActions } from './HostSidebarBottomActions'
import { HostSidebarListToolbar } from './HostSidebarListToolbar'
import type { HostScreenController } from './use-host-screen-controller'

vi.mock('react-native', () => ({
  Pressable: 'Pressable',
  StyleSheet: { create: (styles: unknown) => styles, hairlineWidth: 1 },
  Text: 'Text',
  View: 'View'
}))
vi.mock('lucide-react-native', () => ({
  Filter: 'Filter',
  Layers: 'Layers',
  List: 'List',
  MoreHorizontal: 'MoreHorizontal',
  Plus: 'Plus',
  Search: 'Search',
  SlidersHorizontal: 'SlidersHorizontal',
  SquareTerminal: 'SquareTerminal',
  UserCircle: 'UserCircle',
  X: 'X'
}))

const SCROLL = new Set(['ScrollView', 'SectionList', 'FlatList'])
const MOBILE_ROOT = join(import.meta.dirname, '..', '..')

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
    actions: { navigateFromHostList, openNewWorktreeModal, openFloatingWorkspace },
    connState: overrides?.connState ?? 'connected',
    floatingWorkspaceEnabled: overrides?.floatingWorkspaceEnabled ?? true,
    hostId: 'host-1',
    insets: { top: 0, right: 0, bottom: overrides?.bottomInset ?? 12, left: 0 },
    settings: {
      activeFilterCount: overrides?.activeFilterCount ?? 0,
      selectedSortLabel: overrides?.selectedSortLabel ?? 'Recent'
    },
    state: {
      groupMode: overrides?.groupMode ?? 'none',
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

function assertNamedTouchTargets(tree: ReactTestRenderer) {
  const nodes = pressables(tree)
  expect(nodes.length).toBeGreaterThan(0)
  for (const node of nodes) {
    expect(node.props.accessibilityRole).toBe('button')
    expect(typeof node.props.accessibilityLabel).toBe('string')
    expect(String(node.props.accessibilityLabel).length).toBeGreaterThan(0)
    expect(resolvedStyle(node.props.style).minHeight).toBeGreaterThanOrEqual(44)
    expect(ancestorTypes(node).some((name) => SCROLL.has(name))).toBe(false)
  }
  const iconOnly = nodes.filter((node) => textCount(node) === 0)
  expect(iconOnly.length).toBeGreaterThan(0)
  expect(iconOnly.every((node) => String(node.props.accessibilityLabel).length > 0)).toBe(true)
}

describe('embedded directory actions split into a toolbar and a pinned bar', () => {
  it('puts search, filter count, sort, and group above the list', () => {
    const row = probe({ activeFilterCount: 3, groupMode: 'repo', selectedSortLabel: 'Recent' })
    const tree = render(createElement(HostSidebarListToolbar, { controller: row.controller }))
    expect(labels(tree)).toEqual([
      'Search workspaces',
      'Filter workspaces, 3 active',
      'Sort by Recent',
      'Group workspaces'
    ])
    expect(texts(tree).map((node) => node.props.children)).toEqual([3, 'Recent', 'Repo'])
    expect(tree.root.findAll((node) => SCROLL.has(typeName(node.type)))).toEqual([])
    assertNamedTouchTargets(tree)
    expect(
      pressables(tree)
        .filter((node) => textCount(node) === 0)
        .map((node) => node.props.accessibilityLabel)
    ).toEqual(['Search workspaces'])

    act(() => {
      byLabel(tree, 'Search workspaces').props.onPress()
      byLabel(tree, 'Filter workspaces, 3 active').props.onPress()
      byLabel(tree, 'Sort by Recent').props.onPress()
      byLabel(tree, 'Group workspaces').props.onPress()
    })
    const toggle = row.setShowSearch.mock.calls[0]?.[0]
    if (typeof toggle !== 'function') {
      throw new Error('search did not toggle')
    }
    expect(toggle(false)).toBe(true)
    expect(row.setShowFilterModal).toHaveBeenCalledWith(true)
    expect(row.setShowSortPicker).toHaveBeenCalledWith(true)
    expect(row.setShowGroupPicker).toHaveBeenCalledWith(true)
  })

  it('hides the filter badge when nothing is active and renames search while it is open', () => {
    const idle = probe({ activeFilterCount: 0, showSearch: false })
    const idleTree = render(createElement(HostSidebarListToolbar, { controller: idle.controller }))
    expect(
      byLabel(idleTree, 'Filter workspaces').findAll((node) => typeName(node.type) === 'Text')
    ).toEqual([])
    expect(
      pressables(idleTree)
        .filter((node) => textCount(node) === 0)
        .map((node) => node.props.accessibilityLabel)
    ).toEqual(['Search workspaces', 'Filter workspaces'])

    const open = probe({ showSearch: true, groupMode: 'workspaceStatus' })
    const openTree = render(createElement(HostSidebarListToolbar, { controller: open.controller }))
    expect(labels(openTree)[0]).toBe('Close search')
    expect(texts(openTree).map((node) => node.props.children)).toContain('Status')
  })

  it('pins New workspace as the primary action, with accounts, tasks, and more', () => {
    const row = probe({ bottomInset: 12 })
    const tree = render(createElement(HostSidebarBottomBar, { controller: row.controller }))
    expect(labels(tree)).toEqual(['New workspace', 'Accounts', 'Tasks', 'More actions'])
    expect(tree.root.findAll((node) => SCROLL.has(typeName(node.type)))).toEqual([])
    const json = tree.toJSON()
    if (json === null || Array.isArray(json)) {
      throw new Error('expected one host root')
    }
    expect(json.type).toBe('View')
    expect(resolvedStyle(json.props.style)).toMatchObject({ flexShrink: 0, paddingBottom: 12 })
    assertNamedTouchTargets(tree)
    expect(
      pressables(tree)
        .filter((node) => textCount(node) === 0)
        .map((node) => node.props.accessibilityLabel)
    ).toEqual(['Accounts', 'Tasks', 'More actions'])

    const primary = resolvedStyle(byLabel(tree, 'New workspace').props.style)
    expect(primary).toMatchObject({
      flex: 1,
      minHeight: 44,
      backgroundColor: colors.surfaceBright
    })
    expect(resolvedStyle(byLabel(tree, 'Accounts').props.style).backgroundColor).not.toBe(
      colors.surfaceBright
    )

    act(() => {
      byLabel(tree, 'New workspace').props.onPress()
      byLabel(tree, 'Accounts').props.onPress()
      byLabel(tree, 'Tasks').props.onPress()
      byLabel(tree, 'More actions').props.onPress()
    })
    expect(row.openNewWorktreeModal).toHaveBeenCalledTimes(1)
    expect(row.navigateFromHostList.mock.calls).toEqual([
      ['/h/host-1/accounts'],
      ['/h/host-1/tasks']
    ])
    expect(labels(tree)).toEqual([
      'Floating Workspace',
      'New workspace',
      'Accounts',
      'Tasks',
      'More actions'
    ])
    assertNamedTouchTargets(tree)
    act(() => {
      byLabel(tree, 'Floating Workspace').props.onPress()
    })
    expect(row.openFloatingWorkspace).toHaveBeenCalledTimes(1)
    expect(labels(tree)).not.toContain('Floating Workspace')
  })

  it('disables New workspace, Accounts, and Tasks while the host is disconnected', () => {
    const row = probe({ connState: 'reconnecting', activeFilterCount: 2 })
    const bar = render(createElement(HostSidebarBottomBar, { controller: row.controller }))
    for (const label of ['New workspace', 'Accounts', 'Tasks']) {
      expect(byLabel(bar, label).props.disabled).toBe(true)
    }
    expect(byLabel(bar, 'More actions').props.disabled).toBeFalsy()
    act(() => {
      byLabel(bar, 'More actions').props.onPress()
    })
    expect(byLabel(bar, 'Floating Workspace').props.disabled).toBe(true)
    expect(resolvedStyle(byLabel(bar, 'New workspace').props.style).opacity).toBe(
      resolvedStyle([{ opacity: 0.6 }]).opacity
    )

    const tools = render(createElement(HostSidebarListToolbar, { controller: row.controller }))
    for (const label of [
      'Search workspaces',
      'Filter workspaces, 2 active',
      'Sort by Recent',
      'Group workspaces'
    ]) {
      expect(byLabel(tools, label).props.disabled).toBeFalsy()
    }
    act(() => {
      byLabel(tools, 'Filter workspaces, 2 active').props.onPress()
    })
    expect(row.setShowFilterModal).toHaveBeenCalledWith(true)
  })

  it('omits More when Floating Workspace is unavailable', () => {
    const row = probe({ floatingWorkspaceEnabled: false })
    const tree = render(createElement(HostSidebarBottomActions, { controller: row.controller }))
    expect(labels(tree)).toEqual(['New workspace', 'Accounts', 'Tasks'])
    expect(tree.root.findAll((node) => SCROLL.has(typeName(node.type)))).toEqual([])
  })

  it('keeps both groups out of a scrolling list', () => {
    const row = probe({ activeFilterCount: 1 })
    const trees = [HostSidebarListToolbar, HostSidebarBottomActions].map((part) =>
      render(createElement(part, { controller: row.controller }))
    )
    expect(trees.flatMap((tree) => labels(tree))).toEqual([
      'Search workspaces',
      'Filter workspaces, 1 active',
      'Sort by Recent',
      'Group workspaces',
      'New workspace',
      'Accounts',
      'Tasks',
      'More actions'
    ])
    for (const tree of trees) {
      expect(tree.root.findAll((node) => SCROLL.has(typeName(node.type)))).toEqual([])
    }
  })

  it('does not build the toolbar or the bottom bar out of a list scroller', () => {
    const offenders = [
      'src/host-screen/HostSidebarBottomBar.tsx',
      'src/host-screen/HostSidebarBottomActions.tsx',
      'src/host-screen/host-sidebar-action-styles.ts',
      'src/host-screen/HostSidebarListToolbar.tsx'
    ].filter((file) =>
      /ScrollView|SectionList|FlatList/.test(readFileSync(join(MOBILE_ROOT, file), 'utf8'))
    )
    expect(offenders).toEqual([])
  })
})
