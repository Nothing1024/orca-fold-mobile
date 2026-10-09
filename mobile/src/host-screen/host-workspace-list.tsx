import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AuthFailedBanner } from '../components/AuthFailedBanner'
import { HostDiagnosticsLink } from '../components/HostDiagnosticsLink'
import { HostRouteNoticeBanner } from '../components/HostRouteNoticeBanner'
import { MobileSearchField } from '../components/MobileSearchField'
import { NewWorkspaceFab } from '../components/NewWorkspaceFab'
import {
  sessionNavMatchesWorktree,
  useMobileSessionNav
} from '../session/mobile-session-nav-bridge'
import { isFloatingWorkspaceWorktreeId } from '../session/floating-workspace'
import { HostWorkspaceSessions } from './HostWorkspaceSessions'
import { colors, spacing } from '../theme/mobile-theme'
import { HostWorkspaceListStates } from '../worktree/host-workspace-list-states'
import { HostSidebarWorkspaceTools } from './HostSidebarWorkspaceTools'
import { HostSidebarWorkspacesHeader } from './HostSidebarWorkspacesHeader'
import { HostWorktreeSectionList } from './HostWorktreeSectionList'
import { hostScreenStyles as styles } from './host-screen-styles'
import type { HostScreenController } from './use-host-screen-controller'

export function HostWorkspaceList({ controller }: { controller: HostScreenController }) {
  const {
    actions,
    connState,
    displayWorktrees,
    embedded,
    forceReconnectHost,
    hostId,
    noticeParam,
    reconnectAttempts,
    relayRecovery,
    routeNotice,
    router,
    sectionsResult,
    setDismissedNotice,
    settings,
    state
  } = controller
  const { sections } = sectionsResult
  const sessionNav = useMobileSessionNav()
  // The wide sidebar draws edge to edge, so the pinned tool row has to clear the nav bar itself.
  const insets = useSafeAreaInsets()
  const openWorktreeListed =
    sessionNav != null &&
    displayWorktrees.some((worktree) =>
      sessionNavMatchesWorktree(sessionNav, hostId, worktree.worktreeId)
    )
  const detachedSessionNav =
    sessionNav != null && sessionNav.hostId === hostId && !openWorktreeListed ? sessionNav : null
  // Listed selection and a filtered-out selection share the lower pane; the phone still nests rows.
  const embeddedSessionNav = embedded
    ? openWorktreeListed
      ? sessionNav
      : detachedSessionNav
    : null

  const notices = (
    <>
      {/* Auth failed: a latched relay rejection must reach the same re-pair affordance. */}
      {(connState === 'auth-failed' || relayRecovery.pairingRejected) && (
        <AuthFailedBanner
          canRetry={!!hostId && forceReconnectHost !== null}
          onRetry={() => hostId && forceReconnectHost && void forceReconnectHost(hostId)}
          onRepair={() => router.push('/pair-scan')}
          onRemove={() => state.setConfirmRemoveHost(true)}
        />
      )}

      {connState !== 'connected' &&
      !relayRecovery.pairingRejected &&
      reconnectAttempts >= 3 &&
      hostId ? (
        <HostDiagnosticsLink
          onPress={() =>
            router.push({ pathname: '/connection-log', params: { hostId: String(hostId) } })
          }
        />
      ) : null}

      {/* Why a bounced route landed here (e.g. the workspace was deleted on the desktop). */}
      {routeNotice && (
        <HostRouteNoticeBanner
          message={routeNotice}
          onDismiss={() => setDismissedNotice(noticeParam ?? null)}
        />
      )}

      {/* An action that did not happen. Above the list and dismissible, because the list, the
          header and the confirm it re-opens all have to stay on screen. */}
      {state.actionError !== '' && (
        <HostRouteNoticeBanner
          message={state.actionError}
          tone="failure"
          onDismiss={() => state.setActionError('')}
        />
      )}
    </>
  )

  const searchBar = state.showSearch ? (
    <View style={styles.searchBar}>
      <MobileSearchField
        value={state.search}
        onChangeText={state.setSearch}
        placeholder="Search worktrees…"
        autoFocus
        // Why: new key per open remounts the focus effect across rapid toggles so the keyboard reappears.
        focusKey={state.showSearch}
        accessibilityLabel="Search worktrees"
      />
    </View>
  ) : null

  const listStates = (wide: boolean) => (
    <HostWorkspaceListStates
      connState={connState}
      worktreesLoaded={state.worktreesLoaded}
      displayCount={displayWorktrees.length}
      sectionCount={sections.length}
      catalogError={state.catalogError}
      search={state.search}
      activeFilterCount={settings.activeFilterCount}
      embedded={wide}
    />
  )

  const worktreeList = <HostWorktreeSectionList controller={controller} sessionNav={sessionNav} />

  if (embedded) {
    return (
      <View style={embeddedSplitStyles.column}>
        <View style={embeddedSplitStyles.workspacesPane} accessibilityLabel="Workspaces">
          {notices}
          <HostSidebarWorkspacesHeader controller={controller} />
          {searchBar}
          {listStates(true)}
          {worktreeList}
        </View>
        <View style={embeddedSplitStyles.sessionsPane} accessibilityLabel="Sessions">
          {embeddedSessionNav != null ? (
            <ScrollView
              style={embeddedSplitStyles.sessionScroll}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              accessibilityLabel="Workspace session pane"
            >
              {detachedSessionNav != null &&
              isFloatingWorkspaceWorktreeId(detachedSessionNav.worktreeId) ? (
                <Text style={styles.sectionTitle}>Floating Workspace</Text>
              ) : null}
              <HostWorkspaceSessions
                nav={embeddedSessionNav}
                hideWorkspaceTools
                titleOverride={sidebarSessionsTitle(state.worktrees, embeddedSessionNav.worktreeId)}
                onActivated={actions.onWorkspaceActivated}
              />
            </ScrollView>
          ) : null}
        </View>
        <View
          style={[embeddedSplitStyles.toolPane, { paddingBottom: insets.bottom }]}
          accessibilityLabel="Workspace tools"
        >
          <HostSidebarWorkspaceTools controller={controller} />
        </View>
      </View>
    )
  }

  return (
    <>
      {notices}
      {searchBar}
      {listStates(false)}
      {detachedSessionNav ? (
        <View style={styles.list}>
          {isFloatingWorkspaceWorktreeId(detachedSessionNav.worktreeId) ? (
            <Text style={styles.sectionTitle}>Floating Workspace</Text>
          ) : null}
          <HostWorkspaceSessions
            nav={detachedSessionNav}
            onActivated={actions.onWorkspaceActivated}
          />
        </View>
      ) : null}
      {worktreeList}
      {/* Floating "new workspace" button — phone page only. The embedded sidebar lists the action. */}
      <NewWorkspaceFab
        onPress={actions.openNewWorktreeModal}
        disabled={connState !== 'connected'}
      />
    </>
  )
}

/**
 * Wide session pane title, matching the sidebar row: a child worktree shows its
 * branch, a repo's main worktree shows the repo. Null keeps the nav's own name
 * (folder workspaces, rows not in the catalog yet).
 */
export function sidebarSessionsTitle(
  worktrees: readonly {
    worktreeId: string
    branch: string
    repo: string
    isMainWorktree?: boolean
    workspaceKind?: 'git' | 'folder-workspace'
  }[],
  worktreeId: string
): string | null {
  const match = worktrees.find((worktree) => worktree.worktreeId === worktreeId)
  if (!match || match.workspaceKind === 'folder-workspace') {
    return null
  }
  if (match.isMainWorktree === false) {
    return match.branch.replace(/^refs\/heads\//, '')
  }
  return match.repo || null
}

const embeddedSplitStyles = StyleSheet.create({
  column: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.sidebarPanel
  },
  // Take spare height, but never more than half the sidebar. flexBasis 0 is what
  // makes the cap real: auto basis sizes to content and ignores maxHeight.
  workspacesPane: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    maxHeight: '50%',
    minHeight: 132
  },
  // Take whatever the workspaces cap leaves, so the tool row stays at the bottom.
  sessionsPane: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle
  },
  sessionScroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs
  },
  toolPane: {
    flexGrow: 0,
    flexShrink: 0
  }
})
