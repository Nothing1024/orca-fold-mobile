import { Pressable, View } from 'react-native'
import { useState } from 'react'
import { styles } from './mobile-session-styles'
import type { MobileSessionController } from './use-mobile-session-controller'
import { MobileSessionContentRow } from './MobileSessionContentRow'
import { MobileSessionHeader } from './MobileSessionHeader'
import { MobileSessionRail } from './MobileSessionRail'
import { MobileSessionSheets } from './MobileSessionSheets'

export function MobileSessionSurface({ controller }: { controller: MobileSessionController }) {
  const { setMobileSessionRootRef, isWideLayout } = controller
  const [showCompactRail, setShowCompactRail] = useState(false)
  return (
    <View ref={setMobileSessionRootRef} style={styles.container}>
      <View style={styles.kavInner}>
        {isWideLayout ? (
          <View style={styles.sessionWorkspaceFrame}>
            <MobileSessionRail controller={controller} />
            <View style={styles.sessionWorkspaceContent}>
              {/* Content-row host (KTD2): on wide, content shares this row with the docked panel as the flex-1 left child. */}
              <MobileSessionContentRow controller={controller} />
            </View>
          </View>
        ) : (
          <>
            <MobileSessionHeader
              controller={controller}
              onOpenSessionRail={() => setShowCompactRail(true)}
            />
            <MobileSessionContentRow controller={controller} />
            {showCompactRail ? (
              <>
                <Pressable
                  style={styles.sessionRailBackdrop}
                  onPress={() => setShowCompactRail(false)}
                  accessibilityLabel="Close workspace and sessions"
                />
                <View style={styles.sessionRailOverlay}>
                  <MobileSessionRail
                    controller={controller}
                    onSessionSelected={() => setShowCompactRail(false)}
                  />
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
