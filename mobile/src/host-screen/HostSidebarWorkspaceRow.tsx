import { GitBranch, Pin } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { triggerMediumImpact } from '../platform/haptics'
import { colors, radii, spacing, typography } from '../theme/mobile-theme'
import type { WorktreeListRowItem } from '../components/WorktreeListRow'
import type { SidebarRowRole } from './workspace-sidebar-clusters'

type Props<T extends WorktreeListRowItem> = {
  item: T
  isReadOnly: boolean
  showPin?: boolean
  /** Wide sidebar only. A child indents and shows only its branch; other rows show the repo. */
  role?: SidebarRowRole
  onPress: (item: T) => void
  onLongPress?: (item: T) => void
}

function displayBranch(branch: string): string {
  return branch.replace(/^refs\/heads\//, '')
}

/**
 * Text shown after the name on a non-child row. Empty when it would only repeat
 * the name, e.g. a `main` worktree on branch `main`, or a name derived from the
 * branch. Compared after trimming; case is significant.
 */
export function sidebarRowMeta(name: string, meta: string): string {
  return meta.trim() === name.trim() ? '' : meta
}

/**
 * Name of a non-child wide-sidebar row. A git row shows its repo, not the host's
 * displayName: an unrenamed worktree's displayName is its branch, so repos all on
 * `main` would read as identical `main` rows. Folder workspaces keep their label.
 */
export function sidebarRowName(
  item: Pick<WorktreeListRowItem, 'workspaceKind' | 'displayName' | 'repo'>
): string {
  if (item.workspaceKind === 'folder-workspace') {
    return item.displayName || item.repo
  }
  return item.repo || item.displayName
}

/** Wide-sidebar workspace row: one line of name, optional branch and session count. */
function HostSidebarWorkspaceRowComponent<T extends WorktreeListRowItem>({
  item,
  isReadOnly,
  showPin = false,
  role = 'standalone',
  onPress,
  onLongPress
}: Props<T>) {
  const isFolderWorkspace = item.workspaceKind === 'folder-workspace'
  const metaText = isFolderWorkspace
    ? item.comment?.trim() || item.path || 'Folder'
    : displayBranch(item.branch)
  const name = sidebarRowName(item)
  const isChild = role === 'child'
  // A repo row names only its repo; branches live on the indented child rows. A
  // non-main worktree outside its tree (its main row filtered out) keeps its
  // branch beside the repo so it stays identifiable.
  const showsMeta = isFolderWorkspace || item.isMainWorktree === false
  const rowMeta = showsMeta ? sidebarRowMeta(name, metaText) : ''
  const selected = item.isActive === true

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isChild ? metaText : name}
      accessibilityState={{ selected, disabled: isReadOnly }}
      hitSlop={{ top: 8, bottom: 8 }}
      style={({ pressed }) => [
        styles.row,
        isChild && styles.rowChild,
        selected && styles.rowSelected,
        pressed && styles.rowPressed
      ]}
      disabled={isReadOnly}
      onPress={() => onPress(item)}
      onLongPress={
        onLongPress
          ? () => {
              triggerMediumImpact()
              onLongPress(item)
            }
          : undefined
      }
      delayLongPress={400}
    >
      {isChild ? (
        <GitBranch size={12} color={selected ? colors.sidebarSelectionText : colors.textMuted} />
      ) : null}
      <Text
        style={[
          isChild ? styles.childBranch : styles.name,
          !isChild && rowMeta ? styles.nameBeforeMeta : null,
          selected && styles.nameSelected,
          item.unread && styles.nameUnread,
          isReadOnly && styles.readOnly
        ]}
        numberOfLines={1}
      >
        {isChild ? metaText : name}
      </Text>
      {isChild || !rowMeta ? null : (
        <Text style={[styles.meta, selected && styles.metaSelected]} numberOfLines={1}>
          {rowMeta}
        </Text>
      )}
      {item.unread ? <View style={styles.unreadDot} /> : null}
      {showPin ? <Pin size={11} color={colors.textMuted} /> : null}
      <View style={styles.grow} />
      {item.liveTerminalCount > 0 ? (
        <Text style={[styles.count, selected && styles.countSelected]}>
          {item.liveTerminalCount}
        </Text>
      ) : null}
    </Pressable>
  )
}

export function HostSidebarWorkspaceRow<T extends WorktreeListRowItem>(props: Props<T>) {
  return <HostSidebarWorkspaceRowComponent {...props} />
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 28,
    marginHorizontal: spacing.md,
    marginTop: 1,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sidebarRow,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  rowSelected: {
    backgroundColor: colors.sidebarSelectionFill,
    borderColor: colors.sidebarSelectionBorder
  },
  rowChild: {
    paddingLeft: 20
  },
  rowPressed: {
    backgroundColor: colors.sidebarIconPressed
  },
  grow: {
    flex: 1
  },
  name: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: typography.sidebarNameSize,
    fontWeight: '400',
    color: colors.textSecondary
  },
  // With a branch beside it the name keeps priority: it never shrinks below its
  // own width, up to 60% of the row, and the branch takes what is left.
  nameBeforeMeta: {
    flexShrink: 0,
    maxWidth: '60%'
  },
  nameSelected: {
    color: colors.textPrimary
  },
  nameUnread: {
    fontWeight: '700'
  },
  readOnly: {
    opacity: 0.5
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentBlue
  },
  meta: {
    flexShrink: 1,
    minWidth: 0,
    fontFamily: typography.monoFamily,
    fontSize: typography.sidebarLabelSize,
    color: colors.textMuted
  },
  childBranch: {
    flexShrink: 1,
    minWidth: 0,
    fontFamily: typography.monoFamily,
    fontSize: typography.metaSize,
    fontWeight: '400',
    color: colors.textSecondary
  },
  metaSelected: {
    color: colors.sidebarSelectionText
  },
  count: {
    minWidth: 18,
    textAlign: 'right',
    fontSize: typography.sidebarLabelSize,
    fontVariant: ['tabular-nums'],
    color: colors.textMuted
  },
  countSelected: {
    color: colors.sidebarSelectionText
  }
})
