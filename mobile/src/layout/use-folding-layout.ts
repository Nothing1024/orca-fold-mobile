import { useEffect, useMemo, useState } from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import {
  addWindowLayoutListener,
  getCurrentWindowLayout,
  type NativeWindowLayout
} from '../../modules/orca-window-layout/src'
import { getFoldingLayoutPolicy, type FoldingLayoutPolicy } from './folding-layout-policy'
import {
  getResponsiveLayoutMetrics,
  type ResponsiveLayoutMetrics
} from './responsive-layout-metrics'

export type FoldingLayout = FoldingLayoutPolicy & ResponsiveLayoutMetrics

function usableNativeLayout(layout: NativeWindowLayout | null): layout is NativeWindowLayout {
  return layout != null && layout.width > 0 && layout.height > 0
}

function readNativeSnapshot(): NativeWindowLayout | null {
  try {
    const snapshot = getCurrentWindowLayout()
    return usableNativeLayout(snapshot) ? snapshot : null
  } catch {
    // The activity may not exist during the first render or in a test runtime.
    return null
  }
}

/** Combines native folding data with the existing dimensions-based fallback. */
export function useFoldingLayout(): FoldingLayout {
  const dimensions = useWindowDimensions()
  const [nativeLayout, setNativeLayout] = useState<NativeWindowLayout | null>(() => {
    if (Platform.OS !== 'android') {
      return null
    }
    return readNativeSnapshot()
  })

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return
    }
    const subscription = addWindowLayoutListener((layout) => {
      if (usableNativeLayout(layout)) {
        setNativeLayout(layout)
      }
    })
    return () => subscription.remove()
  }, [])

  const width = nativeLayout?.width ?? dimensions.width
  const height = nativeLayout?.height ?? dimensions.height
  return useMemo(() => {
    const responsive = getResponsiveLayoutMetrics(width, height)
    const policy = getFoldingLayoutPolicy({
      width,
      height,
      foldingFeatureBounds: nativeLayout?.foldingFeatureBounds,
      foldingFeatureState: nativeLayout?.foldingFeatureState,
      foldingFeatureOcclusionType: nativeLayout?.foldingFeatureOcclusionType,
      isSeparating: nativeLayout?.isSeparating
    })
    return { ...responsive, ...policy }
  }, [height, nativeLayout, width])
}
