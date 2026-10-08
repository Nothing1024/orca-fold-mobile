import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Filter, Plus, Search, X } from 'lucide-react-native'
import { colors, radii, spacing, typography } from '../theme/mobile-theme'
import { hostScreenStyles } from './host-screen-styles'
import type { HostScreenController } from './use-host-screen-controller'

const ICON = 16

/** WORKSPACES title row: count, search, the filter menu, and new workspace. */
export function HostSidebarWorkspacesHeader({ controller }: { controller: HostScreenController }) {
  const { actions, connState, displayWorktrees, settings, state } = controller
  const filterCount = settings.activeFilterCount
  const disconnected = connState !== 'connected'
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Text style={styles.label}>WORKSPACES</Text>
        <Text style={styles.count}>{displayWorktrees.length}</Text>
        <Pressable
          style={styles.iconButton}
          onPress={() => state.setShowSearch((s) => !s)}
          accessibilityRole="button"
          accessibilityLabel={state.showSearch ? 'Close search' : 'Search workspaces'}
          hitSlop={6}
        >
          {state.showSearch ? (
            <X size={ICON} color={colors.textSecondary} />
          ) : (
            <Search size={ICON} color={colors.textSecondary} />
          )}
        </Pressable>
        <Pressable
          style={styles.iconButton}
          onPress={() => {
            setMenuOpen((open) => !open)
          }}
          accessibilityRole="button"
          accessibilityLabel={
            filterCount > 0
              ? `Filter, sort, and group, ${filterCount} active`
              : 'Filter, sort, and group'
          }
          accessibilityState={{ expanded: menuOpen }}
          hitSlop={6}
        >
          <Filter size={ICON} color={filterCount > 0 ? colors.textPrimary : colors.textSecondary} />
          {filterCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{filterCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          style={[styles.iconButton, disconnected && hostScreenStyles.toolbarIconDisabled]}
          onPress={actions.openNewWorktreeModal}
          disabled={disconnected}
          accessibilityRole="button"
          accessibilityLabel="New workspace"
          hitSlop={6}
        >
          <Plus size={ICON} color={disconnected ? colors.textMuted : colors.textSecondary} />
        </Pressable>
      </View>
      {menuOpen ? (
        <View style={styles.menu}>
          <Pressable
            style={styles.menuItem}
            onPress={() => state.setShowFilterModal(true)}
            accessibilityRole="button"
            accessibilityLabel={`Filter workspaces${filterCount > 0 ? `, ${filterCount} active` : ''}`}
          >
            <Text style={styles.menuText}>Filter</Text>
          </Pressable>
          <Pressable
            style={styles.menuItem}
            onPress={() => state.setShowSortPicker(true)}
            accessibilityRole="button"
            accessibilityLabel={`Sort by ${settings.selectedSortLabel}`}
          >
            <Text style={styles.menuText}>{settings.selectedSortLabel}</Text>
          </Pressable>
          <Pressable
            style={styles.menuItem}
            onPress={() => state.setShowGroupPicker(true)}
            accessibilityRole="button"
            accessibilityLabel="Group workspaces"
          >
            <Text style={styles.menuText}>Group</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { zIndex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    gap: spacing.xs
  },
  label: {
    fontSize: typography.sidebarLabelSize,
    fontWeight: '600',
    letterSpacing: typography.sidebarLabelTracking,
    color: colors.textMuted
  },
  count: {
    flex: 1,
    fontSize: typography.sidebarLabelSize,
    color: colors.textMuted
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sidebarIcon
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 14,
    height: 14,
    paddingHorizontal: 3,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentBlue
  },
  badgeText: {
    color: colors.onAccent,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12
  },
  menu: {
    position: 'absolute',
    top: 40,
    right: spacing.sm,
    minWidth: 160,
    borderRadius: radii.sidebarRow,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.sidebarPanel,
    overflow: 'hidden'
  },
  menuItem: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md
  },
  menuText: {
    color: colors.textPrimary,
    fontSize: typography.bodySize
  }
})
