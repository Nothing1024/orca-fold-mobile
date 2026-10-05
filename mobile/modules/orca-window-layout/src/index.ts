import { Platform } from 'react-native'
import { requireOptionalNativeModule } from 'expo-modules-core'

export type WindowLayoutBounds = {
  left: number
  top: number
  width: number
  height: number
}

export type NativeWindowLayout = {
  /** Dimensions and feature bounds are in React Native layout dp. */
  width: number
  height: number
  snapshotAvailable: boolean
  foldingFeatureBounds?: WindowLayoutBounds
  foldingFeatureState?: 'flat' | 'half-opened' | 'unknown'
  foldingFeatureOcclusionType?: 'none' | 'full' | 'unknown'
  isSeparating: boolean
}

type WindowLayoutModule = {
  getCurrentLayout: () => NativeWindowLayout
  addListener: (
    eventName: 'onWindowLayout',
    listener: (event: NativeWindowLayout) => void
  ) => {
    remove: () => void
  }
}

const nativeWindowLayout: WindowLayoutModule | null =
  Platform.OS === 'android'
    ? requireOptionalNativeModule<WindowLayoutModule>('OrcaWindowLayout')
    : null

export function getCurrentWindowLayout(): NativeWindowLayout | null {
  return nativeWindowLayout?.getCurrentLayout() ?? null
}

export function addWindowLayoutListener(listener: (event: NativeWindowLayout) => void): {
  remove: () => void
} {
  return nativeWindowLayout?.addListener('onWindowLayout', listener) ?? { remove: () => undefined }
}
