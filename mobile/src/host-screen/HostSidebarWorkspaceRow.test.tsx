import { createElement } from 'react'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import { describe, expect, it, vi } from 'vitest'
import { colors, radii, typography } from '../theme/mobile-theme'
import { HostSidebarWorkspaceRow, sidebarRowMeta } from './HostSidebarWorkspaceRow'
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
    repo: 'orca',
    branch: 'refs/heads/feature/sidebar',
    displayName: 'orca-mobile',
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
  it('selects with the blue fill and border, and hides the phone-row chrome', () => {
    const tree = render({ isActive: true, unread: true })
    const flat = pressedStyle(tree)
    expect(flat).toMatchObject({
      borderRadius: radii.sidebarRow,
      backgroundColor: colors.sidebarSelectionFill,
      borderColor: colors.sidebarSelectionBorder
    })
    expect(texts(tree)).toEqual(['orca-mobile', 'feature/sidebar', '3'])
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

  it('indents a child row and shows only its branch', () => {
    const tree = render({ isActive: true, liveTerminalCount: 1 }, false, 'child')
    expect(texts(tree)).toEqual(['feature/sidebar', '1'])
    const branch = tree.root.find((node) => typeName(node.type) === 'GitBranch')
    expect(branch.props.size).toBe(12)
    expect(branch.props.color).toBe(colors.sidebarSelectionText)
    expect(pressedStyle(tree).paddingLeft).toBe(20)
    expect(pressedStyle(tree).gap).toBe(7)
    expect(pressedStyle(tree).marginTop).toBe(1)
  })

  it('drops a zero session count and shows the pin', () => {
    const tree = render({ liveTerminalCount: 0, isActive: false }, true)
    expect(texts(tree)).toEqual(['orca-mobile', 'feature/sidebar'])
    expect(tree.root.findAll((node) => typeName(node.type) === 'Pin')).toHaveLength(1)
    const flat = pressedStyle(tree)
    expect(flat.backgroundColor).toBeUndefined()
    expect(flat.borderColor).toBe('transparent')
  })

  it('keeps the name ahead of a long branch, which truncates instead', () => {
    const tree = render({
      isActive: true,
      displayName: 'orca-mobile',
      branch: 'refs/heads/feat/merged-workspace-session-nav'
    })
    expect(texts(tree)).toEqual(['orca-mobile', 'feat/merged-workspace-session-nav', '3'])
    const [name, branch, count] = tree.root.findAll((node) => typeName(node.type) === 'Text')
    const flat = (node: typeof name): Record<string, unknown> =>
      Object.assign({}, ...[node?.props.style].flat().filter(Boolean))
    expect(flat(name)).toMatchObject({ flexShrink: 0, maxWidth: '60%' })
    expect(name?.props.numberOfLines).toBe(1)
    expect(flat(branch)).toMatchObject({ flexShrink: 1, minWidth: 0 })
    expect(branch?.props.numberOfLines).toBe(1)
    expect(flat(count).flexShrink).toBeUndefined()
  })

  it('hides the branch when it repeats the name', () => {
    const alone = render({
      displayName: 'feat/merged-workspace-session-nav',
      branch: 'refs/heads/feat/merged-workspace-session-nav'
    })
    expect(texts(alone)).toEqual(['feat/merged-workspace-session-nav', '3'])
    const nameStyle = Object.assign(
      {},
      ...[alone.root.findAll((node) => typeName(node.type) === 'Text')[0]?.props.style]
        .flat()
        .filter(Boolean)
    )
    // Alone on the row, the name may use the whole width.
    expect(nameStyle).toMatchObject({ flexShrink: 1, minWidth: 0 })
    expect(nameStyle.maxWidth).toBeUndefined()
    expect(texts(render({ displayName: 'main', branch: 'refs/heads/main' }))).toEqual(['main', '3'])
    expect(
      texts(render({ displayName: 'feat/x', branch: 'refs/heads/feat/x', isActive: true }))
    ).toEqual(['feat/x', '3'])
    expect(texts(render({ displayName: '', repo: 'main', branch: 'main' }))).toEqual(['main', '3'])
  })

  it('keeps a child row on its branch even when it matches the name', () => {
    const tree = render({ displayName: 'main', branch: 'refs/heads/main' }, false, 'child')
    expect(texts(tree)).toEqual(['main', '3'])
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
