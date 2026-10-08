import { Pressable, Text, View } from 'react-native'
import {
  File,
  FileText,
  Folder,
  GitBranch,
  Globe,
  MoreHorizontal,
  Plus,
  SquareChevronRight,
  SquareTerminal
} from 'lucide-react-native'
import { MobileAgentIcon } from '../components/MobileAgentIcon'
import { triggerMediumImpact } from '../platform/haptics'
import {
  getMobileSessionTabTitle,
  resolveMobileTerminalTabAgentId
} from '../session/mobile-terminal-tab-agent'
import type { MobileSessionNavSnapshot } from '../session/mobile-session-nav-bridge'
import type { MobileSessionTab } from '../session/mobile-session-route-types'
import { mobileSessionRailStyles as rail } from '../session/mobile-session-rail-styles'
import { colors } from '../theme/mobile-theme'

function SessionTabIcon({ tab }: { tab: MobileSessionTab }) {
  if (tab.type === 'browser') {
    return <Globe size={15} color={colors.textSecondary} strokeWidth={2.1} />
  }
  if (tab.type === 'markdown') {
    return <FileText size={15} color={colors.textSecondary} strokeWidth={2.1} />
  }
  if (tab.type === 'file') {
    return <File size={15} color={colors.textSecondary} strokeWidth={2.1} />
  }
  if (tab.type === 'agent-session') {
    return <MobileAgentIcon agentId={tab.agent} size={15} />
  }
  const agentId = resolveMobileTerminalTabAgentId(tab)
  return agentId ? (
    <MobileAgentIcon agentId={agentId} size={15} />
  ) : (
    <SquareTerminal size={15} color={colors.textSecondary} strokeWidth={2.1} />
  )
}

/** Sessions of the open workspace, rendered inside the single host nav. */
export function HostWorkspaceSessions({
  nav,
  onActivated,
  hideWorkspaceTools = false
}: {
  nav: MobileSessionNavSnapshot
  onActivated?: () => void
  /** Wide sidebar pins these on its own tool row. */
  hideWorkspaceTools?: boolean
}) {
  return (
    <View style={rail.sessionRailNest} accessibilityLabel="Workspace sessions">
      <Text style={rail.sessionRailSectionLabel}>Sessions</Text>
      {nav.tabs.length === 0 ? (
        <Text style={rail.sessionRailConnectionText}>No sessions</Text>
      ) : (
        nav.tabs.map((tab) => {
          const isActive = tab.id === nav.activeTabId
          const title = getMobileSessionTabTitle(tab)
          return (
            <Pressable
              key={tab.id}
              style={({ pressed }) => [
                rail.sessionRailItem,
                isActive && rail.sessionRailItemActive,
                pressed && rail.sessionRailActionPressed
              ]}
              onPress={() => {
                nav.switchTab(tab)
                onActivated?.()
              }}
              onLongPress={() => {
                triggerMediumImpact()
                nav.openTabMenu(tab)
              }}
              delayLongPress={400}
              accessibilityRole="button"
              accessibilityLabel={`${title} session`}
              accessibilityState={{ selected: isActive }}
            >
              <SessionTabIcon tab={tab} />
              <Text
                style={[rail.sessionRailItemText, isActive && rail.sessionRailItemTextActive]}
                numberOfLines={1}
              >
                {title}
              </Text>
            </Pressable>
          )
        })
      )}
      <Pressable
        style={({ pressed }) => [rail.sessionRailAction, pressed && rail.sessionRailActionPressed]}
        disabled={nav.createDisabled}
        onPress={() => {
          nav.createSession()
          onActivated?.()
        }}
        accessibilityRole="button"
        accessibilityLabel="New session"
      >
        <Plus size={17} color={colors.textSecondary} strokeWidth={2.2} />
        <Text style={rail.sessionRailActionText}>New Session</Text>
      </Pressable>
      {hideWorkspaceTools ? null : (
        <Pressable
          style={({ pressed }) => [rail.sessionRailAction, pressed && rail.sessionRailActionPressed]}
          disabled={nav.createDisabled}
          onPress={() => {
            nav.openQuickCommands()
            onActivated?.()
          }}
          accessibilityRole="button"
          accessibilityLabel="Quick commands"
        >
          <SquareChevronRight size={17} color={colors.textSecondary} strokeWidth={2.2} />
          <Text style={rail.sessionRailActionText}>Quick Commands</Text>
        </Pressable>
      )}
      {hideWorkspaceTools || !nav.showFiles ? null : (
        <Pressable
          style={({ pressed }) => [
            rail.sessionRailAction,
            nav.activePanel === 'files' && rail.sessionRailItemActive,
            pressed && rail.sessionRailActionPressed
          ]}
          onPress={() => {
            nav.openFiles()
            onActivated?.()
          }}
          accessibilityRole="button"
          accessibilityLabel="Open file explorer"
        >
          <Folder size={17} color={colors.textSecondary} strokeWidth={2.1} />
          <Text style={rail.sessionRailActionText}>Files</Text>
        </Pressable>
      )}
      {hideWorkspaceTools || !nav.showSourceControl ? null : (
        <Pressable
          style={({ pressed }) => [
            rail.sessionRailAction,
            nav.activePanel === 'sourceControl' && rail.sessionRailItemActive,
            pressed && rail.sessionRailActionPressed
          ]}
          onPress={() => {
            nav.openSourceControl()
            onActivated?.()
          }}
          accessibilityRole="button"
          accessibilityLabel="Open source control"
        >
          <GitBranch size={17} color={colors.textSecondary} strokeWidth={2.1} />
          <Text style={rail.sessionRailActionText}>Source Control</Text>
        </Pressable>
      )}
      {hideWorkspaceTools || !nav.showMore ? null : (
        <Pressable
          style={({ pressed }) => [
            rail.sessionRailAction,
            nav.activePanel === 'pr' && rail.sessionRailItemActive,
            pressed && rail.sessionRailActionPressed
          ]}
          onPress={() => {
            nav.openMore()
            onActivated?.()
          }}
          accessibilityRole="button"
          accessibilityLabel="More session actions"
        >
          <MoreHorizontal size={17} color={colors.textSecondary} strokeWidth={2.1} />
          <Text style={rail.sessionRailActionText}>More</Text>
        </Pressable>
      )}
    </View>
  )
}
