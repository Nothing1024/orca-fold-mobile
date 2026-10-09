import { Pressable, StyleSheet, Text, View } from 'react-native'
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
import { isFloatingWorkspaceWorktreeId } from '../session/floating-workspace'
import {
  getMobileSessionTabTitle,
  resolveMobileTerminalTabAgentId
} from '../session/mobile-terminal-tab-agent'
import type { MobileSessionNavSnapshot } from '../session/mobile-session-nav-bridge'
import type { MobileSessionTab } from '../session/mobile-session-route-types'
import { mobileSessionRailStyles as rail } from '../session/mobile-session-rail-styles'
import { colors, radii, spacing, typography } from '../theme/mobile-theme'

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

function sessionPaneTitle(nav: MobileSessionNavSnapshot): string {
  // The host list already names this sentinel above the pane.
  if (isFloatingWorkspaceWorktreeId(nav.worktreeId)) {
    return ''
  }
  return nav.workspaceName?.trim() ?? ''
}

/** Sessions of the open workspace, rendered inside the single host nav. */
export function HostWorkspaceSessions({
  nav,
  onActivated,
  hideWorkspaceTools = false,
  titleOverride = null
}: {
  nav: MobileSessionNavSnapshot
  onActivated?: () => void
  /** Wide sidebar pins these on its own tool row. */
  hideWorkspaceTools?: boolean
  /** Branch of the open child worktree, resolved from the host catalog. */
  titleOverride?: string | null
}) {
  const title = titleOverride ?? sessionPaneTitle(nav)
  const statusFor = (tabId: string): string => {
    if (tabId !== nav.activeTabId) {
      return 'idle'
    }
    return nav.activeTabView === 'chat' ? 'Chat' : 'active'
  }
  if (hideWorkspaceTools) {
    return (
      <View accessibilityLabel="Workspace sessions">
        <View style={wide.heading}>
          <Text style={wide.headingLabel} numberOfLines={1}>
            {title ? `SESSIONS · ${title}` : 'SESSIONS'}
          </Text>
          <Text style={wide.headingCount}>{nav.tabs.length}</Text>
          <Pressable
            style={wide.newSession}
            disabled={nav.createDisabled}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              nav.createSession()
              onActivated?.()
            }}
            accessibilityRole="button"
            accessibilityLabel="New Session"
            accessibilityState={{ disabled: nav.createDisabled }}
          >
            <Plus size={14} color={colors.textMuted} strokeWidth={2.2} />
          </Pressable>
        </View>
        {nav.tabs.length === 0 ? (
          <Text style={rail.sessionRailConnectionText}>No sessions</Text>
        ) : (
          nav.tabs.map((tab) => {
            const isActive = tab.id === nav.activeTabId
            const tabTitle = getMobileSessionTabTitle(tab)
            const status = statusFor(tab.id)
            return (
              <Pressable
                key={tab.id}
                style={({ pressed }) => [
                  wide.row,
                  isActive && wide.rowActive,
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
                accessibilityLabel={`${tabTitle} session, ${status}`}
                accessibilityState={{ selected: isActive }}
              >
                <SessionTabIcon tab={tab} />
                <Text style={[wide.rowName, isActive && wide.rowNameActive]} numberOfLines={1}>
                  {tabTitle}
                </Text>
                <Text style={[wide.rowStatus, isActive && wide.rowStatusActive]}>{status}</Text>
              </Pressable>
            )
          })
        )}
      </View>
    )
  }
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
          style={({ pressed }) => [
            rail.sessionRailAction,
            pressed && rail.sessionRailActionPressed
          ]}
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

const wide = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: 6
  },
  headingLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: typography.sidebarLabelSize,
    fontWeight: '400',
    letterSpacing: typography.sidebarLabelTracking,
    color: colors.textMuted
  },
  // A long title truncates against the count instead of touching it; the count
  // and the + button never shrink.
  headingCount: {
    flexShrink: 0,
    marginLeft: 6,
    fontSize: typography.sidebarLabelSize,
    color: colors.textMuted
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 28,
    marginTop: 1,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sidebarRow,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  rowActive: {
    backgroundColor: colors.sidebarSelectionFill,
    borderColor: colors.sidebarSelectionBorder
  },
  rowName: {
    flex: 1,
    minWidth: 0,
    fontSize: typography.sidebarNameSize,
    fontWeight: '400',
    color: colors.textSecondary
  },
  rowNameActive: {
    fontWeight: '600'
  },
  rowStatus: {
    fontSize: typography.sidebarLabelSize,
    color: colors.textMuted
  },
  rowStatusActive: {
    color: colors.sidebarSelectionText
  },
  newSession: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    marginVertical: -13,
    marginRight: -10
  }
})
