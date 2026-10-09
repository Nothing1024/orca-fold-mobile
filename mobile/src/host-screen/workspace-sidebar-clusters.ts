import type { WorktreeListRowItem } from '../components/WorktreeListRow'

export type SidebarRowRole = 'main' | 'child' | 'standalone'

export type SidebarClusterRow<T extends WorktreeListRowItem> = {
  item: T
  role: SidebarRowRole
}

function branchName(branch: string): string {
  return branch.replace(/^refs\/heads\//, '')
}

function isMainRow(item: WorktreeListRowItem): boolean {
  if (item.isMainWorktree !== undefined) {
    return item.isMainWorktree
  }
  if (item.workspaceKind === 'folder-workspace') {
    return true
  }
  const branch = branchName(item.branch)
  return branch === 'main' || branch === 'master'
}

function repoKey(item: WorktreeListRowItem): string {
  return item.repoId ?? item.repo
}

/**
 * One section's visible rows, emitted as repo clusters at the first member's
 * position. A child indents only while its main row is visible here.
 */
export function sidebarClusterRows<T extends WorktreeListRowItem>(
  rows: readonly T[]
): SidebarClusterRow<T>[] {
  const result: SidebarClusterRow<T>[] = []
  const placed = new Set<string>()
  for (const row of rows) {
    if (placed.has(row.worktreeId)) {
      continue
    }
    const siblings = rows.filter(
      (item) => repoKey(item) === repoKey(row) && !placed.has(item.worktreeId)
    )
    const main = siblings.find(isMainRow)
    if (main === undefined) {
      result.push({ item: row, role: 'standalone' })
      placed.add(row.worktreeId)
      continue
    }
    const children = siblings.filter((item) => item.worktreeId !== main.worktreeId)
    result.push({ item: main, role: children.length > 0 ? 'main' : 'standalone' })
    placed.add(main.worktreeId)
    for (const child of children) {
      result.push({ item: child, role: 'child' })
      placed.add(child.worktreeId)
    }
  }
  return result
}
