import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { List, MoreHorizontal, Plus, SquareTerminal, UserCircle } from 'lucide-react-native'
import { colors } from '../theme/mobile-theme'
import {
  ICON_SIZE,
  directoryStyles,
  guardedIconStyle,
  menuStyle,
  plainIconStyle,
  primaryStyle
} from './host-sidebar-action-styles'
import type { HostScreenController } from './use-host-screen-controller'

/** Global actions. More opens on this bar, so Floating Workspace is not inside the list. */
export function HostSidebarBottomActions({ controller }: { controller: HostScreenController }) {
  const { actions, connState, floatingWorkspaceEnabled, hostId } = controller
  const disconnected = connState !== 'connected'
  const iconColor = disconnected ? colors.textMuted : colors.textSecondary
  const [moreOpen, setMoreOpen] = useState(false)
  const guardedIcon = guardedIconStyle(disconnected)
  return (
    <View style={directoryStyles.bottom}>
      {moreOpen && floatingWorkspaceEnabled ? (
        <Pressable
          style={menuStyle(disconnected)}
          onPress={() => {
            setMoreOpen(false)
            actions.openFloatingWorkspace()
          }}
          disabled={disconnected}
          accessibilityRole="button"
          accessibilityLabel="Floating Workspace"
        >
          <SquareTerminal size={ICON_SIZE} color={iconColor} strokeWidth={2.1} />
          <Text style={directoryStyles.menuText}>Floating Workspace</Text>
        </Pressable>
      ) : null}
      <View style={directoryStyles.bottomRow}>
        <Pressable
          style={primaryStyle(disconnected)}
          onPress={actions.openNewWorktreeModal}
          disabled={disconnected}
          accessibilityRole="button"
          accessibilityLabel="New workspace"
        >
          <Plus
            size={ICON_SIZE}
            color={disconnected ? colors.textMuted : colors.bgBase}
            strokeWidth={2.2}
          />
          <Text
            style={[
              directoryStyles.primaryText,
              disconnected && directoryStyles.primaryTextDisabled
            ]}
            numberOfLines={1}
          >
            New workspace
          </Text>
        </Pressable>
        <Pressable
          style={guardedIcon}
          onPress={() => actions.navigateFromHostList(`/h/${encodeURIComponent(hostId)}/accounts`)}
          disabled={disconnected}
          accessibilityRole="button"
          accessibilityLabel="Accounts"
        >
          <UserCircle size={ICON_SIZE} color={iconColor} strokeWidth={2.1} />
        </Pressable>
        <Pressable
          style={guardedIcon}
          onPress={() => actions.navigateFromHostList(`/h/${encodeURIComponent(hostId)}/tasks`)}
          disabled={disconnected}
          accessibilityRole="button"
          accessibilityLabel="Tasks"
        >
          <List size={ICON_SIZE} color={iconColor} strokeWidth={2.1} />
        </Pressable>
        {floatingWorkspaceEnabled ? (
          <Pressable
            style={plainIconStyle}
            onPress={() => setMoreOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityLabel="More actions"
            accessibilityState={{ expanded: moreOpen }}
          >
            <MoreHorizontal size={ICON_SIZE} color={colors.textSecondary} strokeWidth={2.1} />
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}
