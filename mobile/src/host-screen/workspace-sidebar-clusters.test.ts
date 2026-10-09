import { describe, expect, it } from 'vitest'
import type { WorktreeListRowItem } from '../components/WorktreeListRow'
import { sidebarClusterRows } from './workspace-sidebar-clusters'

function row(overrides: Partial<WorktreeListRowItem>): WorktreeListRowItem {
  return {
    worktreeId: 'wt',
    repo: 'orca',
    repoId: 'repo-orca',
    branch: 'main',
    displayName: 'orca',
    liveTerminalCount: 0,
    preview: '',
    unread: false,
    linkedPR: null,
    ...overrides
  }
}

function roles(rows: WorktreeListRowItem[]): string[] {
  return sidebarClusterRows(rows).map((entry) => `${entry.role}:${entry.item.worktreeId}`)
}

describe('sidebarClusterRows', () => {
  it('keeps a lone worktree as a standalone row', () => {
    expect(roles([row({ worktreeId: 'only' })])).toEqual(['standalone:only'])
  })

  it('puts the main row first and indents the rest of the repo', () => {
    const rows = [
      row({ worktreeId: 'child', branch: 'feat/a', isMainWorktree: false }),
      row({ worktreeId: 'other', repoId: 'repo-relay', repo: 'relay' }),
      row({ worktreeId: 'main', isMainWorktree: true })
    ]
    expect(roles(rows)).toEqual(['main:main', 'child:child', 'standalone:other'])
  })

  it('shows a hit child as a main row when its main row is filtered out', () => {
    const rows = [row({ worktreeId: 'child', branch: 'feat/a', isMainWorktree: false })]
    expect(roles(rows)).toEqual(['standalone:child'])
  })

  it('treats main and master as the main row when the host omits the flag', () => {
    const rows = [
      row({ worktreeId: 'child', branch: 'feat/a' }),
      row({ worktreeId: 'main', branch: 'refs/heads/master' })
    ]
    expect(roles(rows)).toEqual(['main:main', 'child:child'])
  })
})
