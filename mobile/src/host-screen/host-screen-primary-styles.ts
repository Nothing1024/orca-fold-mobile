import { StyleSheet } from 'react-native'
import { colors, radii, spacing, typography } from '../theme/mobile-theme'

export const hostScreenPrimaryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgBase
  },
  // Wide sidebar panel. Phone pages keep container + topChrome.
  sidebarContainer: {
    flex: 1,
    backgroundColor: colors.sidebarPanel
  },
  sidebarTopChrome: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md
  },
  topChrome: {
    backgroundColor: colors.bgPanel,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 34,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.lg
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs
  },
  sidebarCollapseButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.button,
    marginLeft: spacing.xs
  },
  // Embedded sidebar icon buttons: 32pt visual, hitSlop brings the touch target to 44.
  sidebarIconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sidebarIcon,
    backgroundColor: 'transparent'
  },
  sidebarIconButtonPressed: {
    backgroundColor: colors.sidebarIconPressed
  },
  hostIdentity: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.md
  },
  hostIdentityLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minWidth: 0 },
  hostPlatformText: {
    marginLeft: 16,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16
  },
  hostNameText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary
  },
  // Embedded header: host name on the first line, connection words on the second.
  sidebarHostName: {
    fontSize: typography.bodySize,
    fontWeight: '700',
    color: colors.textPrimary
  },
  sidebarConnectionLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: 2,
    minWidth: 0
  },
  sidebarConnectionText: {
    flexShrink: 1,
    fontSize: typography.sidebarLabelSize,
    color: colors.textSecondary
  },
  reconnectButton: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.button,
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  reconnectButtonText: {
    color: colors.textPrimary,
    fontSize: typography.metaSize,
    fontWeight: '600'
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle
  },
  filterChipActive: {
    borderColor: colors.textSecondary,
    backgroundColor: colors.bgRaised
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary
  },
  filterChipTextActive: {
    color: colors.textPrimary
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  sortLabel: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: 12,
    color: colors.textSecondary
  },
  toolbarSpacer: {
    flex: 1
  },
  floatingWorkspaceHeaderButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs
  },
  toolbarIconDisabled: {
    opacity: 0.6
  },
  searchToggle: {
    padding: spacing.xs
  },
  searchBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.bgPanel
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.bodySize
  }
})
