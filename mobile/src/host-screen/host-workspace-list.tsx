import { ScrollView, StyleSheet, Text, View } from 'react-native'
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

  const listStates = (
    <HostWorkspaceListStates
      connState={connState}
      worktreesLoaded={state.worktreesLoaded}
      displayCount={displayWorktrees.length}
      sectionCount={sections.length}
      catalogError={state.catalogError}
      search={state.search}
      activeFilterCount={settings.activeFilterCount}
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
          {listStates}
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
                onActivated={actions.onWorkspaceActivated}
              />
            </ScrollView>
          ) : null}
        </View>
        <View style={embeddedSplitStyles.toolPane} accessibilityLabel="Workspace tools" />
      </View>
    )
  }

  return (
    <>
      {notices}
      {searchBar}
      {listStates}
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

const embeddedSplitStyles = StyleSheet.create({
  column: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.sidebarPanel
  },
  // Hug the rows, then give height up first. Below ~132 the list scrolls inside.
  // flexBasis 0 is what makes the cap real: auto basis sizes to content and ignores maxHeight.
  workspacesPane: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 132
  },
  // Keep its content up to about 54% of the sidebar, then scroll.
  sessionsPane: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    maxHeight: '54%',
    minHeight: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle
  },
  sessionScroll: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs
  },
  toolPane: {
    flexGrow: 0,
    flexShrink: 0
  }
})
