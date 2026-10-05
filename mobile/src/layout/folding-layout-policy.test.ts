import { describe, expect, it } from 'vitest'
import { getFoldingLayoutPolicy } from './folding-layout-policy'

describe('folding layout policy', () => {
  it('keeps existing compact and expanded thresholds when no folding data exists', () => {
    expect(getFoldingLayoutPolicy({ width: 560, height: 1024 })).toMatchObject({
      mode: 'compact',
      paneRects: [{ left: 0, top: 0, width: 560, height: 1024 }]
    })
    expect(getFoldingLayoutPolicy({ width: 820, height: 1180 }).mode).toBe('expanded')
  })

  it('splits a separating vertical hinge and excludes the hinge bounds', () => {
    expect(
      getFoldingLayoutPolicy({
        width: 1800,
        height: 1200,
        isSeparating: true,
        foldingFeatureBounds: { left: 890, top: 0, width: 20, height: 1200 }
      })
    ).toEqual({
      mode: 'separating',
      paneRect: { left: 0, top: 0, width: 890, height: 1200 },
      paneRects: [
        { left: 0, top: 0, width: 890, height: 1200 },
        { left: 910, top: 0, width: 890, height: 1200 }
      ],
      safeExclusion: { left: 890, top: 0, width: 20, height: 1200 }
    })
  })

  it('splits a separating horizontal hinge into upper and lower areas', () => {
    expect(
      getFoldingLayoutPolicy({
        width: 1200,
        height: 1800,
        isSeparating: true,
        foldingFeatureBounds: { left: 0, top: 890, width: 1200, height: 20 }
      }).paneRects
    ).toEqual([
      { left: 0, top: 0, width: 1200, height: 890 },
      { left: 0, top: 910, width: 1200, height: 890 }
    ])
  })

  it('falls back safely for incomplete or inconsistent native bounds', () => {
    expect(
      getFoldingLayoutPolicy({
        width: 820,
        height: 1180,
        isSeparating: true,
        foldingFeatureBounds: { left: 900, top: 0, width: 20, height: 1180 }
      })
    ).toMatchObject({ mode: 'expanded', safeExclusion: null })
  })
})
