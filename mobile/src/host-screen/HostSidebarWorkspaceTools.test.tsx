import { createElement } from 'react'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  publishMobileSessionNav,
  type MobileSessionNavSnapshot
} from '../session/mobile-session-nav-bridge'
import { colors } from '../theme/mobile-theme'
import { HostSidebarWorkspaceTools } from './HostSidebarWorkspaceTools'
import type { HostScreenController } from './use-host-screen-controller'

vi.mock('react-native', () => ({
  Pressable: 'Pressable',
  StyleSheet: { create: <T,>(styles: T) => styles, hairlineWidth: 1 },
  Text: 'Text',
  View: 'View'
}))
vi.mock('lucide-react-native', () => ({
  Folder: 'Folder',
  GitBranch: 'GitBranch',
  SquareChevronRight: 'SquareChevronRight'
}))

function nav(overrides: Partial<MobileSessionNavSnapshot> = {}): MobileSessionNavSnapshot {
  return {
    hostId: 'host-1',
    worktreeId: 'wt-1',
    activeTabId: null,
    tabs: [],
    createDisabled: false,
    showFiles: true,
    showSourceControl: true,
    showMore: true,
    activePanel: null,
    switchTab: () => {},
    openTabMenu: () => {},
    createSession: () => {},
    openQuickCommands: () => {},
    openFiles: () => {},
    openSourceControl: () => {},
    openPr: () => {},
    openMore: () => {},
    activeTabView: 'terminal',
    ...overrides
  }
}

function controller(): {
  controller: HostScreenController
  onWorkspaceActivated: ReturnType<typeof vi.fn>
} {
  const onWorkspaceActivated = vi.fn()
  const fields = { actions: { onWorkspaceActivated } }
  // oxlint-disable-next-line typescript/consistent-type-assertions -- SAFETY: the tool row reads only actions.onWorkspaceActivated.
  return { controller: fields as unknown as HostScreenController, onWorkspaceActivated }
}

function render(): ReactTestRenderer {
  const rendered: { tree: ReactTestRenderer | null } = { tree: null }
  act(() => {
    rendered.tree = create(
      createElement(HostSidebarWorkspaceTools, { controller: controller().controller })
    )
  })
  if (rendered.tree === null) {
    throw new Error('the tool row did not render')
  }
  return rendered.tree
}

function labels(tree: ReactTestRenderer): string[] {
  return tree.root
    .findAll((node) => String(node.type) === 'Pressable')
    .map((node) => String(node.props.accessibilityLabel))
}

beforeEach(() => {
  publishMobileSessionNav(null)
})

describe('the pinned workspace tool row', () => {
  it('calls each tool and highlights the open panel', () => {
    const openFiles = vi.fn()
    publishMobileSessionNav(nav({ openFiles, activePanel: 'files' }))
    const tree = render()
    expect(labels(tree)).toEqual(['Quick commands', 'Open file explorer', 'Open source control'])
    const files = tree.root.find((node) => node.props.accessibilityLabel === 'Open file explorer')
    const style = Array.isArray(files.props.style)
      ? Object.assign({}, ...files.props.style)
      : files.props.style
    expect(style.backgroundColor).toBe(colors.sidebarSelectionFill)
    act(() => {
      tree.root
        .find((node) => node.props.accessibilityLabel === 'Open file explorer')
        .props.onPress()
    })
    expect(openFiles).toHaveBeenCalledTimes(1)
  })

  it('hides files when the session does not offer them', () => {
    publishMobileSessionNav(nav({ showFiles: false }))
    expect(labels(render())).toEqual(['Quick commands', 'Open source control'])
  })

  it('disables every tool when no session is open', () => {
    const tree = render()
    expect(
      tree.root
        .findAll((node) => String(node.type) === 'Pressable')
        .every((node) => node.props.disabled === true)
    ).toBe(true)
  })
})
