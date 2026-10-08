import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Folder, GitBranch, SquareChevronRight } from 'lucide-react-native'
import { useMobileSessionNav } from '../session/mobile-session-nav-bridge'
import { colors, spacing } from '../theme/mobile-theme'
import type { HostScreenController } from './use-host-screen-controller'

const ICON = 18

type Tool = {
  key: string
  label: string
  accessibilityLabel: string
  icon: typeof Folder
  hidden: boolean
  active: boolean
  onPress: () => void
}

/** The four workspace tools pinned under the wide sidebar. */
export function HostSidebarWorkspaceTools({ controller }: { controller: HostScreenController }) {
  const nav = useMobileSessionNav()
  const disabled = nav == null || nav.createDisabled
  const iconColor = disabled ? colors.textMuted : colors.textSecondary
  const tools: Tool[] = [
    {
      key: 'commands',
      label: 'Commands',
      accessibilityLabel: 'Quick commands',
      icon: SquareChevronRight,
      hidden: false,
      active: false,
      onPress: () => nav?.openQuickCommands()
    },
    {
      key: 'files',
      label: 'Files',
      accessibilityLabel: 'Open file explorer',
      icon: Folder,
      hidden: nav != null && !nav.showFiles,
      active: nav?.activePanel === 'files',
      onPress: () => nav?.openFiles()
    },
    {
      key: 'git',
      label: 'Git',
      accessibilityLabel: 'Open source control',
      icon: GitBranch,
      hidden: nav != null && !nav.showSourceControl,
      active: nav?.activePanel === 'sourceControl',
      onPress: () => nav?.openSourceControl()
    }
  ]
  return (
    <View style={styles.row}>
      {tools
        .filter((tool) => !tool.hidden)
        .map((tool) => (
          <Pressable
            key={tool.key}
            style={[styles.tool, tool.active && styles.toolActive]}
            disabled={disabled}
            onPress={() => {
              tool.onPress()
              controller.actions.onWorkspaceActivated?.()
            }}
            accessibilityRole="button"
            accessibilityLabel={tool.accessibilityLabel}
            accessibilityState={{ disabled, selected: tool.active }}
          >
            <tool.icon size={ICON} color={tool.active ? colors.accentBlue : iconColor} />
            <Text
              style={[styles.label, tool.active && styles.labelActive, disabled && styles.disabled]}
              numberOfLines={1}
            >
              {tool.label}
            </Text>
          </Pressable>
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle
  },
  tool: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.xs
  },
  toolActive: {
    backgroundColor: colors.sidebarSelectionFill
  },
  label: {
    fontSize: 10,
    color: colors.textSecondary
  },
  labelActive: {
    color: colors.accentBlue
  },
  disabled: {
    opacity: 0.6
  }
})
