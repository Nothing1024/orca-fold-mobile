import { Pin } from 'lucide-react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { AgentWorkingMode } from '../../../src/shared/agent-status-types'
import type { MobileRenderableRepoIcon } from './host-screen-reply-schema'
import { AgentSpinner } from '../components/AgentSpinner'
import { MobileRepoIcon } from '../components/MobileRepoIcon'
import { triggerMediumImpact } from '../platform/haptics'
import { colors, radii, spacing, typography } from '../theme/mobile-theme'
import type { WorktreeListRowItem } from '../components/WorktreeListRow'

type WorktreeRollupStatus = 'working' | 'active' | 'permission' | 'done' | 'inactive'

type Props<T extends WorktreeListRowItem> = {
  item: T
  isReadOnly: boolean
  repoColor: string
  repoIcon?: MobileRenderableRepoIcon | null
  status: WorktreeRollupStatus
  workingMode?: AgentWorkingMode
  showPin?: boolean
  onPress: (item: T) => void
  onLongPress?: (item: T) => void
}

function displayBranch(branch: string): string {
  return branch.replace(/^refs\/heads\//, '')
}

/** Wide-sidebar workspace row: icon, name, branch, session count. No phone-row chrome. */
function HostSidebarWorkspaceRowComponent<T extends WorktreeListRowItem>({
  item,
  isReadOnly,
  repoColor,
  repoIcon,
  status,
  workingMode,
  showPin = false,
  onPress,
  onLongPress
}: Props<T>) {
  const isFolderWorkspace = item.workspaceKind === 'folder-workspace'
  const metaText = isFolderWorkspace
    ? item.comment?.trim() || item.path || 'Folder'
    : displayBranch(item.branch)
  const name = item.displayName || item.repo

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityState={{ selected: item.isActive === true, disabled: isReadOnly }}
      style={({ pressed }) => [
        styles.row,
        item.isActive && styles.rowSelected,
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
      <View style={styles.iconSlot}>
        <MobileRepoIcon repoIcon={repoIcon} size={16} color={repoColor} />
        <View style={styles.statusDot}>
          <AgentSpinner status={status} workingMode={workingMode ?? item.workingMode} />
        </View>
      </View>
      <View style={styles.copy}>
        <View style={styles.nameLine}>
          <Text
            style={[styles.name, item.unread && styles.nameUnread, isReadOnly && styles.readOnly]}
            numberOfLines={1}
          >
            {name}
          </Text>
          {item.unread ? <View style={styles.unreadDot} /> : null}
          {showPin ? <Pin size={11} color={colors.textMuted} /> : null}
        </View>
        <Text style={[styles.meta, item.isActive && styles.metaSelected]} numberOfLines={1}>
          {metaText}
        </Text>
      </View>
      {item.liveTerminalCount > 0 ? (
        <Text style={[styles.count, item.isActive && styles.countSelected]}>
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
    gap: spacing.sm,
    marginHorizontal: spacing.sm,
    marginVertical: 2,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: radii.sidebarRow,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  rowSelected: {
    backgroundColor: colors.sidebarSelectionFill,
    borderColor: colors.sidebarSelectionBorder
  },
  rowPressed: {
    backgroundColor: colors.sidebarIconPressed
  },
  iconSlot: {
    width: 16,
    height: 16
  },
  statusDot: {
    position: 'absolute',
    right: -4,
    bottom: -4
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minWidth: 0
  },
  name: {
    flexShrink: 1,
    fontSize: typography.bodySize,
    fontWeight: '600',
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
    marginTop: 1,
    fontFamily: typography.monoFamily,
    fontSize: typography.sidebarLabelSize,
    color: colors.textMuted
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
