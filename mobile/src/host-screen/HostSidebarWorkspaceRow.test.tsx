import { createElement } from 'react'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import { describe, expect, it, vi } from 'vitest'
import { colors, radii, typography } from '../theme/mobile-theme'
import { HostSidebarWorkspaceRow, sidebarRowMeta, sidebarRowName } from './HostSidebarWorkspaceRow'
import type { WorktreeListRowItem } from '../components/WorktreeListRow'

vi.mock('react-native', () => ({
  Pressable: 'Pressable',
  StyleSheet: { create: <T,>(styles: T) => styles },
  Text: 'Text',
  View: 'View'
}))
vi.mock('lucide-react-native', () => ({ GitBranch: 'GitBranch', Pin: 'Pin' }))
vi.mock('../platform/haptics', () => ({ triggerMediumImpact: vi.fn() }))

function item(overrides: Partial<WorktreeListRowItem> = {}): WorktreeListRowItem {
  return {
    worktreeId: 'wt-1',
    repo: 'orca-mobile',
    branch: 'refs/heads/feature/sidebar',
    // Like the desktop host: an unrenamed worktree's displayName is its branch.
    displayName: 'feature/sidebar',
    isMainWorktree: true,
    liveTerminalCount: 3,
    preview: '',
    unread: false,
    linkedPR: { number: 12, state: 'open' },
    ...overrides
  }
}

function render(
  overrides: Partial<WorktreeListRowItem> = {},
  showPin = false,
  role: 'main' | 'child' | 'standalone' = 'standalone'
): ReactTestRenderer {
  const rendered: { tree: ReactTestRenderer | null } = { tree: null }
  act(() => {
    rendered.tree = create(
      createElement(HostSidebarWorkspaceRow, {
        item: item(overrides),
        isReadOnly: false,
        showPin,
        role,
        onPress: () => {}
      })
    )
  })
  if (rendered.tree === null) {
    throw new Error('the row did not render')
  }
  return rendered.tree
}

function typeName(type: unknown): string {
  return typeof type === 'string' ? type : ''
}

function pressedStyle(tree: ReactTestRenderer): Record<string, unknown> {
  const row = tree.root.find((node) => typeName(node.type) === 'Pressable')
  const style = row.props.style
  const resolved = typeof style === 'function' ? style({ pressed: false }) : style
  const list = Array.isArray(resolved) ? resolved : [resolved]
  return Object.assign({}, ...list.filter(Boolean))
}

function texts(tree: ReactTestRenderer): string[] {
  return tree.root
    .findAll((node) => typeName(node.type) === 'Text')
    .map((node) => String(node.props.children))
}

describe('the wide sidebar workspace row', () => {
  it('selects with the blue fill and border, and names a main row by its repo only', () => {
    const tree = render({ isActive: true, unread: true })
    const flat = pressedStyle(tree)
    expect(flat).toMatchObject({
      borderRadius: radii.sidebarRow,
      backgroundColor: colors.sidebarSelectionFill,
      borderColor: colors.sidebarSelectionBorder
    })
    expect(texts(tree)).toEqual(['orca-mobile', '3'])
    expect(tree.root.findAll((node) => typeName(node.type) === 'Pin')).toHaveLength(0)
    expect(tree.root.findAll((node) => typeName(node.type) === 'GitBranch')).toHaveLength(0)
    expect(flat.height).toBe(28)
    const name = tree.root.findAll((node) => typeName(node.type) === 'Text')[0]
    expect(name?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontSize: typography.sidebarNameSize, fontWeight: '400' })
      ])
    )
    expect(typography.sidebarNameSize).toBe(13)
  })

  it('tells repos apart when every main worktree is on main', () => {
    const rows = ['dsh-vibee', 'orca-mobile', 'hermes-plugin'].map((repo) =>
      texts(render({ repo, displayName: 'main', branch: 'refs/heads/main' }))
    )
    expect(rows).toEqual([
      ['dsh-vibee', '3'],
      ['orca-mobile', '3'],
      ['hermes-plugin', '3']
    ])
  })

  it('shows only the repo even when the worktree was renamed', () => {
    expect(texts(render({ displayName: 'my sidebar work', branch: 'refs/heads/feat/x' }))).toEqual([
      'orca-mobile',
      '3'
    ])
  })

  it('indents a child row and shows only its branch', () => {
    const tree = render(
      { isActive: true, liveTerminalCount: 1, isMainWorktree: false },
      false,
      'child'
    )
    expect(texts(tree)).toEqual(['feature/sidebar', '1'])
    const branch = tree.root.find((node) => typeName(node.type) === 'GitBranch')
    expect(branch.props.size).toBe(12)
    expect(branch.props.color).toBe(colors.sidebarSelectionText)
    expect(pressedStyle(tree).paddingLeft).toBe(20)
    expect(pressedStyle(tree).gap).toBe(7)
    expect(pressedStyle(tree).marginTop).toBe(1)
  })

  it('keeps the branch beside the repo for a worktree shown outside its tree', () => {
    const tree = render({
      isMainWorktree: false,
      isActive: true,
      branch: 'refs/heads/feat/merged-workspace-session-nav',
      displayName: 'feat/merged-workspace-session-nav'
    })
    expect(texts(tree)).toEqual(['orca-mobile', 'feat/merged-workspace-session-nav', '3'])
    const [name, branch, count] = tree.root.findAll((node) => typeName(node.type) === 'Text')
    const flat = (node: typeof name): Record<string, unknown> =>
      Object.assign({}, ...[node?.props.style].flat().filter(Boolean))
    expect(flat(name)).toMatchObject({ flexShrink: 0, maxWidth: '60%' })
    expect(flat(branch)).toMatchObject({ flexShrink: 1, minWidth: 0 })
    expect(flat(count).flexShrink).toBeUndefined()
  })

  it('keeps a folder workspace on its own label', () => {
    const tree = render({
      workspaceKind: 'folder-workspace',
      repo: 'session-tool',
      displayName: 'session-tool',
      branch: '',
      path: '/home/u/session-tool',
      liveTerminalCount: 1
    })
    expect(texts(tree)).toEqual(['session-tool', '/home/u/session-tool', '1'])
  })

  it('drops a zero session count and shows the pin', () => {
    const tree = render({ liveTerminalCount: 0, isActive: false }, true)
    expect(texts(tree)).toEqual(['orca-mobile'])
    expect(tree.root.findAll((node) => typeName(node.type) === 'Pin')).toHaveLength(1)
    const flat = pressedStyle(tree)
    expect(flat.backgroundColor).toBeUndefined()
    expect(flat.borderColor).toBe('transparent')
  })
})

describe('sidebarRowName', () => {
  it('uses the repo for git rows and the label for folder workspaces', () => {
    expect(sidebarRowName({ repo: 'orca-mobile', displayName: 'main' })).toBe('orca-mobile')
    expect(sidebarRowName({ repo: '', displayName: 'main' })).toBe('main')
    expect(
      sidebarRowName({ workspaceKind: 'folder-workspace', repo: 'notes', displayName: 'Notes' })
    ).toBe('Notes')
  })
})

describe('sidebarRowMeta', () => {
  it('drops a meta equal to the name after trimming, keeps anything else', () => {
    expect(sidebarRowMeta('main', 'main')).toBe('')
    expect(sidebarRowMeta(' main ', 'main')).toBe('')
    expect(sidebarRowMeta('Main', 'main')).toBe('main')
    expect(sidebarRowMeta('orca-mobile', 'main')).toBe('main')
    expect(sidebarRowMeta('main', '')).toBe('')
  })
})
