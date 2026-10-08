import { View } from 'react-native'
import { HostSidebarBottomActions } from './HostSidebarBottomActions'
import type { HostScreenController } from './use-host-screen-controller'

/** Pinned under both lists, never inside them. The inset clears the system nav bar. */
export function HostSidebarBottomBar({ controller }: { controller: HostScreenController }) {
  return (
    <View
      accessibilityLabel="Workspace actions"
      style={{ flexShrink: 0, paddingBottom: controller.insets.bottom }}
    >
      <HostSidebarBottomActions controller={controller} />
    </View>
  )
}
