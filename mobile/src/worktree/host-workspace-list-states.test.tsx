import { createElement } from 'react'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import { describe, expect, it, vi } from 'vitest'
import { HostWorkspaceListStates } from './host-workspace-list-states'

vi.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator',
  StyleSheet: { create: <T,>(styles: T) => styles },
  Text: 'Text',
  View: 'View'
}))

function render(embedded?: boolean): ReactTestRenderer {
  const rendered: { tree: ReactTestRenderer | null } = { tree: null }
  act(() => {
    rendered.tree = create(
      createElement(HostWorkspaceListStates, {
        connState: 'connected',
        worktreesLoaded: true,
        displayCount: 0,
        sectionCount: 0,
        catalogError: null,
        search: '',
        activeFilterCount: 0,
        embedded
      })
    )
  })
  if (rendered.tree === null) {
    throw new Error('the empty state did not render')
  }
  return rendered.tree
}

describe('HostWorkspaceListStates', () => {
  it('centers the phone empty state and sizes the wide one to its text', () => {
    const phone = render().root.findByType('View').props.style
    const wide = render(true).root.findByType('View').props.style
    expect(phone.flex).toBe(1)
    expect(wide.flex).toBeUndefined()
    expect(wide.paddingVertical).toBeGreaterThan(0)
  })
})
