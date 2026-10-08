import { createElement } from 'react'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import { describe, expect, it, vi } from 'vitest'
import { colors, radii } from '../theme/mobile-theme'
import { HostSidebarWorkspaceRow } from './HostSidebarWorkspaceRow'
import type { WorktreeListRowItem } from '../components/WorktreeListRow'

vi.mock('react-native', () => ({
  Pressable: 'Pressable',
  StyleSheet: { create: <T,>(styles: T) => styles },
  Text: 'Text',
  View: 'View'
}))
vi.mock('lucide-react-native', () => ({ Pin: 'Pin' }))
vi.mock('../platform/haptics', () => ({ triggerMediumImpact: vi.fn() }))
vi.mock('../components/AgentSpinner', () => ({ AgentSpinner: 'AgentSpinner' }))
vi.mock('../components/MobileRepoIcon', () => ({ MobileRepoIcon: 'MobileRepoIcon' }))

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

function render(overrides: Partial<WorktreeListRowItem> = {}, showPin = false): ReactTestRenderer {
  const rendered: { tree: ReactTestRenderer | null } = { tree: null }
  act(() => {
    rendered.tree = create(
      createElement(HostSidebarWorkspaceRow, {
        item: item(overrides),
        isReadOnly: false,
        repoColor: '#f97316',
        repoIcon: null,
        status: 'active',
        showPin,
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
    expect(tree.root.findAll((node) => typeName(node.type) === 'AgentSpinner')).toHaveLength(1)
    expect(tree.root.findAll((node) => typeName(node.type) === 'MobileRepoIcon')).toHaveLength(1)
  })

  it('drops a zero session count and shows the pin', () => {
    const tree = render({ liveTerminalCount: 0, isActive: false }, true)
    expect(texts(tree)).toEqual(['orca-mobile', 'feature/sidebar'])
    expect(tree.root.findAll((node) => typeName(node.type) === 'Pin')).toHaveLength(1)
    const flat = pressedStyle(tree)
    expect(flat.backgroundColor).toBeUndefined()
    expect(flat.borderColor).toBe('transparent')
  })
})
