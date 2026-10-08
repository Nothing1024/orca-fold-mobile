import { StyleSheet } from 'react-native'
import { colors, radii, spacing, typography } from '../theme/mobile-theme'
import { hostScreenStyles } from './host-screen-styles'

export const ICON_SIZE = 18

type PressState = { pressed: boolean }

export function plainIconStyle({ pressed }: PressState) {
  return [directoryStyles.iconButton, pressed && directoryStyles.iconButtonPressed]
}

export function filterStyle(activeFilterCount: number) {
  return ({ pressed }: PressState) => [
    directoryStyles.iconButton,
    activeFilterCount > 0 && directoryStyles.iconButtonActive,
    pressed && directoryStyles.iconButtonPressed
  ]
}

export function labeledStyle({ pressed }: PressState) {
  return [directoryStyles.labeledButton, pressed && directoryStyles.iconButtonPressed]
}

export function guardedIconStyle(disconnected: boolean) {
  return ({ pressed }: PressState) => [
    directoryStyles.iconButton,
    pressed && directoryStyles.iconButtonPressed,
    disconnected && hostScreenStyles.toolbarIconDisabled
  ]
}

export function primaryStyle(disconnected: boolean) {
  return ({ pressed }: PressState) => [
    directoryStyles.primary,
    pressed && !disconnected && directoryStyles.primaryPressed,
    disconnected && hostScreenStyles.toolbarIconDisabled
  ]
}

export function menuStyle(disconnected: boolean) {
  return ({ pressed }: PressState) => [
    directoryStyles.menuButton,
    pressed && directoryStyles.iconButtonPressed,
    disconnected && hostScreenStyles.toolbarIconDisabled
  ]
}

export const directoryStyles = StyleSheet.create({
  root: {
    flexShrink: 0
  },
  toolbar: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.bgPanel
  },
  bottom: {
    flexShrink: 0,
    backgroundColor: colors.bgPanel,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.xs,
    gap: spacing.xs
  },
  iconButton: {
    flexShrink: 0,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.button
  },
  iconButtonPressed: {
    backgroundColor: colors.bgRaised
  },
  iconButtonActive: {
    backgroundColor: colors.bgRaised
  },
  labeledButton: {
    flexShrink: 1,
    minWidth: 44,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.button
  },
  labeledText: {
    flexShrink: 1,
    minWidth: 0,
    color: colors.textSecondary,
    fontSize: typography.metaSize
  },
  badgeAnchor: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: 0,
    minWidth: 16,
    height: 16,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceBright
  },
  badgeText: {
    color: colors.bgBase,
    fontSize: typography.metaSize,
    fontWeight: '600',
    lineHeight: 16
  },
  primary: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.button,
    backgroundColor: colors.surfaceBright
  },
  primaryPressed: {
    backgroundColor: colors.textPrimary
  },
  primaryText: {
    flexShrink: 1,
    minWidth: 0,
    color: colors.bgBase,
    fontSize: typography.bodySize,
    fontWeight: '600'
  },
  primaryTextDisabled: {
    color: colors.textMuted
  },
  menuButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md
  },
  menuText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.bodySize
  }
})
