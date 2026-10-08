import { Pressable, Text, View } from 'react-native'
import { Filter, Layers, Search, SlidersHorizontal, X } from 'lucide-react-native'
import { colors } from '../theme/mobile-theme'
import type { MobileGroupMode } from '../worktree/workspace-view-settings'
import {
  ICON_SIZE,
  directoryStyles,
  filterStyle,
  labeledStyle,
  plainIconStyle
} from './host-sidebar-action-styles'
import type { HostScreenController } from './use-host-screen-controller'

function groupLabel(mode: MobileGroupMode): string {
  switch (mode) {
    case 'none':
      return 'Group'
    case 'workspaceStatus':
      return 'Status'
    case 'repo':
      return 'Repo'
    case 'prStatus':
      return 'PR'
  }
}

/** Search, filter, sort, and group. Sits above the worktree list, not inside it. */
export function HostSidebarListToolbar({ controller }: { controller: HostScreenController }) {
  const { settings, state } = controller
  const filterCount = settings.activeFilterCount
  return (
    <View style={directoryStyles.toolbar}>
      <Pressable
        style={plainIconStyle}
        onPress={() => state.setShowSearch((s) => !s)}
        accessibilityRole="button"
        accessibilityLabel={state.showSearch ? 'Close search' : 'Search workspaces'}
      >
        {state.showSearch ? (
          <X size={ICON_SIZE} color={colors.textSecondary} strokeWidth={2.1} />
        ) : (
          <Search size={ICON_SIZE} color={colors.textSecondary} strokeWidth={2.1} />
        )}
      </Pressable>
      <Pressable
        style={filterStyle(filterCount)}
        onPress={() => state.setShowFilterModal(true)}
        accessibilityRole="button"
        accessibilityLabel={`Filter workspaces${settings.activeFilterCount > 0 ? `, ${settings.activeFilterCount} active` : ''}`}
      >
        <View style={directoryStyles.badgeAnchor}>
          <Filter
            size={ICON_SIZE}
            color={filterCount > 0 ? colors.textPrimary : colors.textSecondary}
            strokeWidth={2.1}
          />
          {filterCount > 0 ? (
            <View style={directoryStyles.badge}>
              <Text style={directoryStyles.badgeText}>{filterCount}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
      <Pressable
        style={labeledStyle}
        onPress={() => state.setShowSortPicker(true)}
        accessibilityRole="button"
        accessibilityLabel={`Sort by ${settings.selectedSortLabel}`}
      >
        <SlidersHorizontal size={ICON_SIZE} color={colors.textSecondary} strokeWidth={2.1} />
        <Text style={directoryStyles.labeledText} numberOfLines={1}>
          {settings.selectedSortLabel}
        </Text>
      </Pressable>
      <Pressable
        style={labeledStyle}
        onPress={() => state.setShowGroupPicker(true)}
        accessibilityRole="button"
        accessibilityLabel="Group workspaces"
      >
        <Layers size={ICON_SIZE} color={colors.textSecondary} strokeWidth={2.1} />
        <Text style={directoryStyles.labeledText} numberOfLines={1}>
          {groupLabel(state.groupMode)}
        </Text>
      </Pressable>
    </View>
  )
}
