import { afterEach, describe, expect, it } from 'vitest'
import { createMockRepos, createMockWorktrees } from './mobile-lag-scenario'

afterEach(() => {
  delete process.env.MOCK_MAIN_WORKTREES
})

describe('createMockWorktrees', () => {
  const repos = createMockRepos(1)

  it('marks every row as not the main worktree unless asked', () => {
    const rows = createMockWorktrees(repos, 7)
    expect(rows.map((row) => row.isMainWorktree)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ])
  })

  it('marks every sixth row as the main worktree when MOCK_MAIN_WORKTREES=1', () => {
    process.env.MOCK_MAIN_WORKTREES = '1'
    const rows = createMockWorktrees(repos, 7)
    expect(rows.map((row) => row.isMainWorktree)).toEqual([
      true,
      false,
      false,
      false,
      false,
      false,
      true
    ])
  })
})
