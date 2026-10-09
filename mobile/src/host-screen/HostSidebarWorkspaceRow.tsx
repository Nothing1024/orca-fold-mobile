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
  /** Wide sidebar only. A child indents and shows the branch instead of the repo name. */
  role?: SidebarRowRole
  onPress: (item: T) => void
  onLongPress?: (item: T) => void
}

function displayBranch(branch: string): string {
  return branch.replace(/^refs\/heads\//, '')
}

/** Wide-sidebar workspace row: one line of name, branch and session count. */
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
  const name = item.displayName || item.repo
  const isChild = role === 'child'
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
          selected && styles.nameSelected,
          item.unread && styles.nameUnread,
          isReadOnly && styles.readOnly
        ]}
        numberOfLines={1}
      >
        {isChild ? metaText : name}
      </Text>
      {isChild ? null : (
        <Text style={[styles.meta, selected && styles.metaSelected]} numberOfLines={1}>
          {metaText}
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
    fontSize: typography.sidebarNameSize,
    fontWeight: '400',
    color: colors.textSecondary
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
    fontFamily: typography.monoFamily,
    fontSize: typography.sidebarLabelSize,
    color: colors.textMuted
  },
  childBranch: {
    flexShrink: 1,
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
