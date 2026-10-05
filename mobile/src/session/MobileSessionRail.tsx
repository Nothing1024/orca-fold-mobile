import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ChevronLeft,
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

import { triggerMediumImpact } from '../platform/haptics'
import { MobileAgentIcon } from '../components/MobileAgentIcon'
import { StatusDot } from '../components/StatusDot'
import { colors } from '../theme/mobile-theme'
import {
  getMobileSessionTabTitle,
  resolveMobileTerminalTabAgentId
} from './mobile-terminal-tab-agent'
import { styles } from './mobile-session-styles'
import type { MobileSessionController } from './use-mobile-session-controller'
import type { MobileSessionTab } from './mobile-session-route-types'

function SessionRailTabIcon({ tab }: { tab: MobileSessionTab }) {
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

type MobileSessionRailProps = {
  controller: MobileSessionController
  onSessionSelected?: () => void
}

export function MobileSessionRail({ controller, onSessionSelected }: MobileSessionRailProps) {
  const {
    hostId,
    isFolderWorkspaceRoute,
    isFloatingWorkspaceRoute,
    connState,
    forceReconnectHost,
    worktreeName,
    activePanel,
    activeSessionTabId,
    creating,
    creatingBrowser,
    creatingMarkdown,
    setCreateError,
    setShowCreateTabDrawer,
    setShowQuickCommands,
    setShowHeaderMoreActions,
    quickCommandsSupported,
    showToast,
    requestLeaveSession,
    switchSessionTab,
    openSessionTabActionSheetAfterKeyboardDismiss,
    visibleTabs,
    showConnectionRetry,
    terminalSummary,
    handlePanelTap,
    showHeaderMoreButton
  } = controller
  const createDisabled =
    creating || creatingBrowser || creatingMarkdown || connState !== 'connected'

  const openQuickCommands = () => {
    if (quickCommandsSupported === true) {
      setShowQuickCommands(true)
      return
    }
    showToast(
      quickCommandsSupported === false
        ? 'Desktop update required for quick commands'
        : 'Checking desktop capabilities — try again in a moment',
      1600
    )
  }

  return (
    <SafeAreaView style={styles.sessionRail} edges={['top', 'left', 'bottom']}>
      <View style={styles.sessionRailInner}>
        <View style={styles.sessionRailBrand}>
          <Pressable
            style={({ pressed }) => [
              styles.sessionRailBackButton,
              pressed && styles.backButtonPressed
            ]}
            onPress={requestLeaveSession}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back to worktrees"
          >
            <ChevronLeft size={22} color={colors.textSecondary} strokeWidth={2.2} />
          </Pressable>
          <Text style={styles.sessionRailBrandText}>Orca</Text>
        </View>

        <View style={styles.sessionRailSection}>
          <Text style={styles.sessionRailSectionLabel}>Workspace</Text>
          <View style={styles.sessionRailWorkspace}>
            <Folder size={17} color={colors.textSecondary} strokeWidth={2.1} />
            <Text style={styles.sessionRailWorkspaceText} numberOfLines={1}>
              {worktreeName || 'Terminal'}
            </Text>
          </View>
          <Pressable
            style={styles.sessionRailConnection}
            disabled={!showConnectionRetry}
            onPress={() => {
              if (hostId && forceReconnectHost) {
                void forceReconnectHost(hostId)
              }
            }}
            accessibilityRole={showConnectionRetry ? 'button' : undefined}
            accessibilityLabel={showConnectionRetry ? 'Reconnect to desktop' : undefined}
          >
            <StatusDot state={connState} />
            <Text style={styles.sessionRailConnectionText} numberOfLines={1}>
              {terminalSummary}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.sessionRailSection, styles.sessionRailList]}>
          <Text style={styles.sessionRailSectionLabel}>Sessions</Text>
          <ScrollView
            style={styles.sessionRailList}
            contentContainerStyle={styles.sessionRailListContent}
            showsVerticalScrollIndicator={false}
          >
            {visibleTabs.length === 0 ? (
              <Text style={styles.sessionRailConnectionText}>No sessions</Text>
            ) : (
              visibleTabs.map((tab) => {
                const isActive = tab.id === activeSessionTabId
                return (
                  <Pressable
                    key={tab.id}
                    style={({ pressed }) => [
                      styles.sessionRailItem,
                      isActive && styles.sessionRailItemActive,
                      pressed && styles.sessionRailActionPressed
                    ]}
                    onPress={() => {
                      switchSessionTab(tab)
                      onSessionSelected?.()
                    }}
                    onLongPress={() => {
                      triggerMediumImpact()
                      openSessionTabActionSheetAfterKeyboardDismiss(tab)
                    }}
                    delayLongPress={400}
                    accessibilityRole="button"
                    accessibilityLabel={`${getMobileSessionTabTitle(tab)} session`}
                  >
                    <SessionRailTabIcon tab={tab} />
                    <Text
                      style={[
                        styles.sessionRailItemText,
                        isActive && styles.sessionRailItemTextActive
                      ]}
                      numberOfLines={1}
                    >
                      {getMobileSessionTabTitle(tab)}
                    </Text>
                  </Pressable>
                )
              })
            )}
          </ScrollView>
        </View>

        <View style={styles.sessionRailSection}>
          <Pressable
            style={({ pressed }) => [
              styles.sessionRailAction,
              pressed && styles.sessionRailActionPressed,
              createDisabled && styles.newTerminalButtonDisabled
            ]}
            disabled={createDisabled}
            onPress={() => {
              setCreateError('')
              setShowCreateTabDrawer(true)
            }}
            accessibilityRole="button"
            accessibilityLabel="New session"
          >
            <Plus size={17} color={colors.textSecondary} strokeWidth={2.2} />
            <Text style={styles.sessionRailActionText}>New Session</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.sessionRailAction,
              pressed && styles.sessionRailActionPressed,
              createDisabled && styles.newTerminalButtonDisabled
            ]}
            disabled={createDisabled}
            onPress={openQuickCommands}
            accessibilityRole="button"
            accessibilityLabel="Quick commands"
          >
            <SquareChevronRight size={17} color={colors.textSecondary} strokeWidth={2.2} />
            <Text style={styles.sessionRailActionText}>Quick Commands</Text>
          </Pressable>
          {!isFloatingWorkspaceRoute && (
            <Pressable
              style={({ pressed }) => [
                styles.sessionRailAction,
                activePanel === 'files' && styles.sessionRailItemActive,
                pressed && styles.sessionRailActionPressed
              ]}
              onPress={() => handlePanelTap('files')}
              accessibilityRole="button"
              accessibilityLabel="Open file explorer"
            >
              <Folder size={17} color={colors.textSecondary} strokeWidth={2.1} />
              <Text style={styles.sessionRailActionText}>Files</Text>
            </Pressable>
          )}
          {!isFolderWorkspaceRoute && !isFloatingWorkspaceRoute && (
            <Pressable
              style={({ pressed }) => [
                styles.sessionRailAction,
                activePanel === 'sourceControl' && styles.sessionRailItemActive,
                pressed && styles.sessionRailActionPressed
              ]}
              onPress={() => handlePanelTap('sourceControl')}
              accessibilityRole="button"
              accessibilityLabel="Open source control"
            >
              <GitBranch size={17} color={colors.textSecondary} strokeWidth={2.1} />
              <Text style={styles.sessionRailActionText}>Source Control</Text>
            </Pressable>
          )}
          {showHeaderMoreButton ? (
            <Pressable
              style={({ pressed }) => [
                styles.sessionRailAction,
                activePanel === 'pr' && styles.sessionRailItemActive,
                pressed && styles.sessionRailActionPressed
              ]}
              onPress={() => setShowHeaderMoreActions(true)}
              accessibilityRole="button"
              accessibilityLabel="More session actions"
            >
              <MoreHorizontal size={17} color={colors.textSecondary} strokeWidth={2.1} />
              <Text style={styles.sessionRailActionText}>More</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  )
}
