import { Pressable, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native'
import { ChevronDown, ChevronRight, Pin } from 'lucide-react-native'
import { MobileRepoIcon } from '../components/MobileRepoIcon'
import { FAB_SIZE } from '../components/NewWorkspaceFab'
import { WorktreeListRow } from '../components/WorktreeListRow'
import { HostSidebarWorkspaceRow } from './HostSidebarWorkspaceRow'
import {
  sessionNavMatchesWorktree,
  type MobileSessionNavSnapshot
} from '../session/mobile-session-nav-bridge'
import { colors, spacing, typography } from '../theme/mobile-theme'
import { getWorktreeRowIdentity } from '../worktree/worktree-host-row-identity'
import { getWorktreeStatus, isWorktreePinned } from '../worktree/workspace-list-sections'
import { repoColor } from '../worktree/repo-color'
import { hostScreenStyles as styles } from './host-screen-styles'
import { HostWorkspaceSessions } from './HostWorkspaceSessions'
import type { HostScreenController } from './use-host-screen-controller'

/** Worktree rows grouped into sections. The phone nests the open workspace's sessions under its row. */
export function HostWorktreeSectionList({
  controller,
  sessionNav
}: {
  controller: HostScreenController
  sessionNav: MobileSessionNavSnapshot | null
}) {
  const {
    actions,
    activeWorktreeScroll,
    catalog,
    contentMaxWidth,
    embedded,
    hostId,
    insets,
    isReadOnly,
    isWideLayout,
    now,
    sectionsResult,
    settings,
    state
  } = controller
  const { rawSections, sections, uniqueRepoColors } = sectionsResult
  if (sections.length === 0) {
    return null
  }
  return (
    <SectionList
      ref={activeWorktreeScroll.sectionListRef}
      sections={sections}
      keyExtractor={(w) => w.sectionListKey ?? getWorktreeRowIdentity(w)}
      stickySectionHeadersEnabled={false}
      // Why: keep the search IME up while tapping clear / scrolling results.
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onScrollToIndexFailed={activeWorktreeScroll.onScrollToIndexFailed}
      style={embedded ? sectionListStyles.embedded : undefined}
      // Why: edge-to-edge under the system nav bar; insets.bottom keeps the last phone row above it.
      contentContainerStyle={[
        styles.list,
        // Reserve room so the last row stays tappable above the phone's floating "+".
        {
          paddingBottom: embedded ? spacing.lg : FAB_SIZE + spacing.xl + insets.bottom
        },
        isWideLayout &&
          !embedded && { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }
      ]}
      renderSectionHeader={({ section }) => {
        if (!section.title) {
          return null
        }
        const isCollapsed = state.collapsedGroups.has(section.key)
        const rawSection = rawSections.find((s) => s.key === section.key)
        const count = rawSection?.data.length ?? 0
        const repoSectionColor =
          state.groupMode === 'repo' ? uniqueRepoColors.get(section.title) : null
        const repoSectionIcon =
          state.groupMode === 'repo' ? state.repoIconsByName.get(section.title) : null
        return (
          <Pressable
            style={embedded ? sectionListStyles.groupHeader : styles.sectionHeader}
            onPress={() => settings.toggleCollapsed(section.key)}
            accessibilityRole="button"
            accessibilityLabel={section.title}
            accessibilityState={{ expanded: !isCollapsed }}
          >
            {isCollapsed ? (
              <ChevronRight size={12} color={colors.textMuted} style={styles.sectionIcon} />
            ) : (
              <ChevronDown size={12} color={colors.textMuted} style={styles.sectionIcon} />
            )}
            {section.icon === 'pin' && (
              <Pin size={12} color={colors.textMuted} style={styles.sectionIcon} />
            )}
            {state.groupMode === 'repo' ? (
              <View style={styles.sectionRepoIcon}>
                <MobileRepoIcon
                  repoIcon={repoSectionIcon}
                  size={14}
                  color={repoSectionColor ?? colors.textSecondary}
                />
              </View>
            ) : null}
            <Text style={embedded ? sectionListStyles.groupTitle : styles.sectionTitle}>
              {section.title}
            </Text>
            <Text style={embedded ? sectionListStyles.groupCount : styles.sectionCount}>
              {count}
            </Text>
          </Pressable>
        )
      }}
      ItemSeparatorComponent={embedded ? null : ListSeparator}
      // Why (#8498): manual pull-to-refresh forces a fresh snapshot after a stale-cache reconnect.
      refreshControl={
        <RefreshControl
          refreshing={catalog.refreshing}
          onRefresh={catalog.onRefresh}
          tintColor={colors.textSecondary}
          colors={[colors.textSecondary]}
        />
      }
      renderItem={({ item }) => (
        <View>
          {embedded ? (
            <HostSidebarWorkspaceRow
              item={item}
              isReadOnly={isReadOnly}
              status={getWorktreeStatus(item)}
              repoColor={uniqueRepoColors.get(item.repo) ?? repoColor(item.repo)}
              repoIcon={state.repoIconsByName.get(item.repo) ?? null}
              showPin={isWorktreePinned(item, state.pinnedIds)}
              onPress={actions.openWorktreeSession}
              onLongPress={
                item.workspaceKind === 'folder-workspace' ? undefined : state.setActionTarget
              }
            />
          ) : (
            <WorktreeListRow
              item={item}
              isReadOnly={isReadOnly}
              now={now}
              status={getWorktreeStatus(item)}
              repoColor={uniqueRepoColors.get(item.repo) ?? repoColor(item.repo)}
              repoIcon={state.repoIconsByName.get(item.repo) ?? null}
              hideRepo={state.groupMode === 'repo'}
              showPin={false}
              onPress={actions.openWorktreeSession}
              onLongPress={
                item.workspaceKind === 'folder-workspace' ? undefined : state.setActionTarget
              }
              onToggleLineage={settings.toggleWorktreeLineage}
            />
          )}
          {!embedded && sessionNavMatchesWorktree(sessionNav, hostId, item.worktreeId) ? (
            <HostWorkspaceSessions nav={sessionNav} onActivated={actions.onWorkspaceActivated} />
          ) : null}
        </View>
      )}
    />
  )
}

function ListSeparator() {
  return <View style={styles.separator} />
}

const sectionListStyles = StyleSheet.create({
  // Fill the workspaces pane, which is the region that shrinks and then scrolls.
  embedded: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: 6
  },
  groupTitle: {
    flexShrink: 1,
    fontSize: typography.sidebarLabelSize,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: typography.sidebarLabelTracking
  },
  groupCount: {
    marginLeft: 'auto',
    fontSize: typography.sidebarLabelSize,
    fontVariant: ['tabular-nums'],
    color: colors.textMuted
  }
})
