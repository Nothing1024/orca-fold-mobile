import { Pressable, Text, View } from 'react-native'
import {
  ChevronLeft,
  Filter,
  Layers,
  List,
  PanelLeftClose,
  Search,
  SlidersHorizontal,
  SquareTerminal,
  UserCircle,
  X
} from 'lucide-react-native'
import { StatusDot } from '../components/StatusDot'
import { classifyConnection, type ConnectionVerdict } from '../transport/connection-health'
import { colors } from '../theme/mobile-theme'
import { hostScreenStyles as styles } from './host-screen-styles'
import type { HostScreenController } from './use-host-screen-controller'

function isErrorVerdict(v: ConnectionVerdict): boolean {
  return v.kind === 'warning' || v.kind === 'unreachable' || v.kind === 'auth-failed'
}

/** Three words the wide sidebar prints under the host name. Auth failure keeps its banner. */
function sidebarConnectionText(verdict: ConnectionVerdict): string {
  if (verdict.kind === 'auth-failed') {
    return 'Disconnected'
  }
  if (verdict.label === 'Reconnecting…' || verdict.label.startsWith('Connecting')) {
    return 'Reconnecting…'
  }
  if (verdict.label === 'Disconnected') {
    return 'Disconnected'
  }
  if (verdict.kind === 'normal') {
    return 'Connected'
  }
  return 'Disconnected'
}

export function HostScreenHeader({ controller }: { controller: HostScreenController }) {
  const {
    actions,
    connState,
    embedded,
    floatingWorkspaceEnabled,
    forceReconnectHost,
    hostId,
    hostDisplay,
    lastConnectedAt,
    onHideSidebar,
    reconnectAttempts,
    relayRecovery,
    settings,
    state
  } = controller

  const headerVerdict = classifyConnection({
    state: connState,
    reconnectAttempts,
    lastConnectedAt,
    hostName: state.hostName,
    ...relayRecovery
  })
  const showReconnect =
    connState !== 'connected' &&
    isErrorVerdict(headerVerdict) &&
    !!hostId &&
    headerVerdict.kind !== 'auth-failed' &&
    forceReconnectHost !== null

  if (embedded) {
    return (
      <View style={styles.sidebarTopChrome}>
        <View style={styles.statusBar}>
          <Pressable
            style={({ pressed }) => [
              styles.sidebarIconButton,
              pressed && styles.sidebarIconButtonPressed
            ]}
            onPress={actions.leaveHost}
            accessibilityRole="button"
            accessibilityLabel="Back to hosts"
            hitSlop={6}
          >
            <ChevronLeft size={18} color={colors.textSecondary} />
          </Pressable>
          <View style={styles.hostIdentity}>
            <Text style={styles.sidebarHostName} numberOfLines={1}>
              {hostDisplay.title}
            </Text>
            <View style={styles.sidebarConnectionLine}>
              <StatusDot state={connState} verdict={headerVerdict} />
              <Text style={styles.sidebarConnectionText} numberOfLines={1}>
                {sidebarConnectionText(headerVerdict)}
              </Text>
            </View>
          </View>
          {showReconnect ? (
            <Pressable
              style={styles.reconnectButton}
              onPress={() => void forceReconnectHost(hostId)}
              accessibilityRole="button"
              accessibilityLabel="Reconnect"
              hitSlop={8}
            >
              <Text style={styles.reconnectButtonText}>Reconnect</Text>
            </Pressable>
          ) : null}
          {onHideSidebar ? (
            <Pressable
              style={({ pressed }) => [
                styles.sidebarIconButton,
                pressed && styles.sidebarIconButtonPressed
              ]}
              onPress={onHideSidebar}
              accessibilityRole="button"
              accessibilityLabel="Hide sidebar"
              hitSlop={6}
            >
              <PanelLeftClose size={16} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.topChrome}>
      <View style={styles.statusBar}>
        <Pressable
          style={styles.backButton}
          onPress={actions.leaveHost}
          accessibilityRole="button"
          accessibilityLabel="Back to hosts"
          hitSlop={8}
        >
          <ChevronLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.hostIdentity}>
          <View style={styles.hostIdentityLine}>
            <StatusDot state={connState} verdict={headerVerdict} />
            <Text style={styles.hostNameText} numberOfLines={1}>
              {hostDisplay.title}
            </Text>
          </View>
          {hostDisplay.descriptorLine ? (
            <Text style={styles.hostPlatformText} numberOfLines={1}>
              {hostDisplay.descriptorLine}
            </Text>
          ) : null}
        </View>
        {showReconnect ? (
          <Pressable
            style={styles.reconnectButton}
            onPress={() => void forceReconnectHost(hostId)}
            accessibilityRole="button"
            accessibilityLabel="Reconnect"
            hitSlop={8}
          >
            <Text style={styles.reconnectButtonText}>Reconnect</Text>
          </Pressable>
        ) : null}
        {floatingWorkspaceEnabled ? (
          <Pressable
            style={[
              styles.floatingWorkspaceHeaderButton,
              connState !== 'connected' && styles.toolbarIconDisabled
            ]}
            onPress={actions.openFloatingWorkspace}
            disabled={connState !== 'connected'}
            accessibilityRole="button"
            accessibilityLabel="Floating Workspace"
            hitSlop={8}
          >
            <SquareTerminal
              size={18}
              color={connState === 'connected' ? colors.textPrimary : colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      {/* Phone page keeps this toolbar. The embedded sidebar folds the same actions into its session list. */}
      <View style={styles.toolbar}>
        <Pressable
          style={[styles.filterChip, settings.activeFilterCount > 0 && styles.filterChipActive]}
          onPress={() => state.setShowFilterModal(true)}
          accessibilityRole="button"
          accessibilityLabel={`Filter workspaces${settings.activeFilterCount > 0 ? `, ${settings.activeFilterCount} active` : ''}`}
        >
          <Filter
            size={12}
            color={settings.activeFilterCount > 0 ? colors.textPrimary : colors.textSecondary}
          />
          <Text
            style={[
              styles.filterChipText,
              settings.activeFilterCount > 0 && styles.filterChipTextActive
            ]}
          >
            Filter{settings.activeFilterCount > 0 ? ` (${settings.activeFilterCount})` : ''}
          </Text>
        </Pressable>

        <Pressable
          style={styles.modeButton}
          onPress={() => state.setShowSortPicker(true)}
          accessibilityRole="button"
          accessibilityLabel={`Sort by ${settings.selectedSortLabel}`}
        >
          <SlidersHorizontal size={14} color={colors.textSecondary} />
          <Text style={styles.sortLabel} numberOfLines={1}>
            {settings.selectedSortLabel}
          </Text>
        </Pressable>

        <Pressable
          style={styles.modeButton}
          onPress={() => state.setShowGroupPicker(true)}
          accessibilityRole="button"
          accessibilityLabel="Group workspaces"
        >
          <Layers size={14} color={colors.textSecondary} />
          <Text style={styles.sortLabel} numberOfLines={1}>
            {state.groupMode === 'none'
              ? 'Group'
              : state.groupMode === 'workspaceStatus'
                ? 'Status'
                : state.groupMode === 'repo'
                  ? 'Repo'
                  : 'PR'}
          </Text>
        </Pressable>

        <View style={styles.toolbarSpacer} />

        <Pressable
          style={styles.searchToggle}
          onPress={() => actions.navigateFromHostList(`/h/${encodeURIComponent(hostId)}/accounts`)}
          disabled={connState !== 'connected'}
          accessibilityRole="button"
          accessibilityLabel="Accounts"
        >
          <UserCircle
            size={16}
            color={connState === 'connected' ? colors.textSecondary : colors.textMuted}
          />
        </Pressable>

        <Pressable
          style={styles.searchToggle}
          onPress={() => actions.navigateFromHostList(`/h/${encodeURIComponent(hostId)}/tasks`)}
          disabled={connState !== 'connected'}
          accessibilityRole="button"
          accessibilityLabel="Tasks"
        >
          <List
            size={16}
            color={connState === 'connected' ? colors.textSecondary : colors.textMuted}
          />
        </Pressable>

        <Pressable
          style={styles.searchToggle}
          onPress={() => state.setShowSearch((s) => !s)}
          accessibilityRole="button"
          accessibilityLabel={state.showSearch ? 'Close search' : 'Search workspaces'}
        >
          {state.showSearch ? (
            <X size={16} color={colors.textSecondary} />
          ) : (
            <Search size={16} color={colors.textSecondary} />
          )}
        </Pressable>
      </View>
    </View>
  )
}
