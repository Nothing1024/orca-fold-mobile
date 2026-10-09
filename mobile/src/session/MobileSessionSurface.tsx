import { Pressable, View } from 'react-native'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HostScreen } from '../host-screen/HostScreen'
import { styles } from './mobile-session-styles'
import type { MobileSessionController } from './use-mobile-session-controller'
import { MobileSessionContentRow } from './MobileSessionContentRow'
import { MobileSessionHeader } from './MobileSessionHeader'
import { MobileSessionSheets } from './MobileSessionSheets'
import { usePublishMobileSessionNav } from './use-publish-mobile-session-nav'

export function MobileSessionSurface({ controller }: { controller: MobileSessionController }) {
  const { setMobileSessionRootRef, isWideLayout, hostId } = controller
  const insets = useSafeAreaInsets()
  const [showNavDrawer, setShowNavDrawer] = useState(false)
  usePublishMobileSessionNav(controller)
  const closeNavDrawer = () => setShowNavDrawer(false)
  return (
    <View ref={setMobileSessionRootRef} style={styles.container}>
      <View style={styles.kavInner}>
        {isWideLayout ? (
          // Wide hides MobileSessionHeader, which is the phone's top inset.
          <View style={[styles.sessionWorkspaceFrame, { paddingTop: insets.top }]}>
            <View style={styles.sessionWorkspaceContent}>
              {/* The host layout already shows the one workspace nav. This pane is the session. */}
              <MobileSessionContentRow controller={controller} />
            </View>
          </View>
        ) : (
          <>
            <MobileSessionHeader
              controller={controller}
              onOpenSessionRail={() => setShowNavDrawer(true)}
            />
            <MobileSessionContentRow controller={controller} />
            {showNavDrawer ? (
              <>
                <Pressable
                  style={styles.sessionRailBackdrop}
                  onPress={closeNavDrawer}
                  accessibilityLabel="Close workspace and sessions"
                />
                <View style={styles.sessionRailOverlay}>
                  <View style={styles.sessionNavDrawer}>
                    <HostScreen
                      embedded
                      hostId={hostId}
                      onHideSidebar={closeNavDrawer}
                      onWorkspaceActivated={closeNavDrawer}
                    />
                  </View>
                </View>
              </>
            ) : null}
          </>
        )}
      </View>
      <MobileSessionSheets controller={controller} />
    </View>
  )
}
