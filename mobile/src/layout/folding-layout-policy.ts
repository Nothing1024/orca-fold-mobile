import { getResponsiveLayoutMetrics } from './responsive-layout-metrics'

export type FoldingFeatureBounds = { left: number; top: number; width: number; height: number }
export type FoldingFeatureState = 'flat' | 'half-opened' | 'unknown'
export type FoldingLayoutMode = 'compact' | 'expanded' | 'separating'
export type LayoutRect = { left: number; top: number; width: number; height: number }

export type FoldingLayoutInput = {
  width: number
  height: number
  foldingFeatureBounds?: FoldingFeatureBounds | null
  foldingFeatureState?: FoldingFeatureState | null
  foldingFeatureOcclusionType?: 'none' | 'full' | 'unknown' | null
  isSeparating?: boolean
}

export type FoldingLayoutPolicy = {
  mode: FoldingLayoutMode
  /** First usable area, kept for callers that only render one primary surface. */
  paneRect: LayoutRect
  /** All usable areas, ordered left-to-right or top-to-bottom around the feature. */
  paneRects: LayoutRect[]
  safeExclusion: LayoutRect | null
}

const MIN_RECT_SIZE = 0

function validBounds(
  bounds: FoldingFeatureBounds | null | undefined,
  width: number,
  height: number
): bounds is FoldingFeatureBounds {
  return (
    bounds != null &&
    Number.isFinite(bounds.left) &&
    Number.isFinite(bounds.top) &&
    Number.isFinite(bounds.width) &&
    Number.isFinite(bounds.height) &&
    bounds.width > MIN_RECT_SIZE &&
    bounds.height > MIN_RECT_SIZE &&
    bounds.left >= 0 &&
    bounds.top >= 0 &&
    bounds.left + bounds.width <= width &&
    bounds.top + bounds.height <= height
  )
}

/** Computes layout geometry without depending on native folding APIs. */
export function getFoldingLayoutPolicy(input: FoldingLayoutInput): FoldingLayoutPolicy {
  const { width, height, foldingFeatureBounds, isSeparating } = input
  const metrics = getResponsiveLayoutMetrics(width, height)
  const bounds = validBounds(foldingFeatureBounds, width, height) ? foldingFeatureBounds : null
  const separating = Boolean(isSeparating) && bounds != null

  if (!separating) {
    return {
      mode: metrics.isWideLayout ? 'expanded' : 'compact',
      paneRect: { left: 0, top: 0, width, height },
      paneRects: [{ left: 0, top: 0, width, height }],
      safeExclusion: null
    }
  }

  const vertical = bounds.height >= height * 0.75 && bounds.width < bounds.height
  const paneRects = vertical
    ? [
        { left: 0, top: 0, width: bounds.left, height },
        {
          left: bounds.left + bounds.width,
          top: 0,
          width: width - bounds.left - bounds.width,
          height
        }
      ]
    : [
        { left: 0, top: 0, width, height: bounds.top },
        {
          left: 0,
          top: bounds.top + bounds.height,
          width,
          height: height - bounds.top - bounds.height
        }
      ]

  return { mode: 'separating', paneRect: paneRects[0], paneRects, safeExclusion: bounds }
}
