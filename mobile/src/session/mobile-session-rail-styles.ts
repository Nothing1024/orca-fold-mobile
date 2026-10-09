import { StyleSheet } from 'react-native'

import { HOST_SIDEBAR_DEFAULT_WIDTH } from '../storage/preferences'
import { colors, spacing, radii, typography } from '../theme/mobile-theme'

export const mobileSessionRailStyles = StyleSheet.create({
  sessionNavDrawer: {
    width: HOST_SIDEBAR_DEFAULT_WIDTH,
    flex: 1,
    backgroundColor: colors.bgPanel
  },
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
  sessionPaneTitle: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.bodySize,
    fontWeight: '600'
  },
  // Sits under one workspace row; the border keeps the next workspace out of this block.
  sessionRailNest: {
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.borderSubtle
  },
  sessionRailSectionLabel: {
    paddingHorizontal: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.metaSize,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  sessionRailConnectionText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.metaSize
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
