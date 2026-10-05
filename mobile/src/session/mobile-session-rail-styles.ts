import { StyleSheet } from 'react-native'

import { colors, spacing, radii, typography } from '../theme/mobile-theme'

export const mobileSessionRailStyles = StyleSheet.create({
  sessionRailOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 20,
    elevation: 20
  },
  sessionRailBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 19,
    backgroundColor: colors.bgBase,
    opacity: 0.6
  },
  sessionRail: {
    width: 248,
    flexShrink: 0,
    backgroundColor: colors.bgPanel,
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle
  },
  sessionRailInner: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm
  },
  sessionRailBrand: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle
  },
  sessionRailBrandText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  sessionRailBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sessionRailSection: {
    paddingTop: spacing.md,
    gap: spacing.xs
  },
  sessionRailSectionLabel: {
    paddingHorizontal: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.metaSize,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  sessionRailWorkspace: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.button,
    backgroundColor: colors.bgRaised
  },
  sessionRailWorkspaceText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600'
  },
  sessionRailConnection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingTop: 2
  },
  sessionRailConnectionText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.metaSize
  },
  sessionRailList: {
    flex: 1,
    minHeight: 0
  },
  sessionRailListContent: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md
  },
  sessionRailItem: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.button
  },
  sessionRailItemActive: {
    backgroundColor: colors.bgRaised
  },
  sessionRailItemText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13
  },
  sessionRailItemTextActive: {
    color: colors.textPrimary,
    fontWeight: '600'
  },
  sessionRailAction: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.button
  },
  sessionRailActionPressed: {
    backgroundColor: colors.bgRaised
  },
  sessionRailActionText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13
  }
})
