import { describe, it, expect } from 'vitest'
import { roomAreaM2, roomPerimeterMm } from './geometry'

describe('roomAreaM2', () => {
  it('single rectangle: 4200 × 3500 = 14.7 m²', () => {
    const room = { rectangles: [{ lengthMm: 4200, widthMm: 3500 }] }
    expect(roomAreaM2(room)).toBeCloseTo(14.7, 5)
  })

  it('L-shape: two rectangles summed', () => {
    const room = {
      rectangles: [
        { lengthMm: 4000, widthMm: 3000 }, // 12 m²
        { lengthMm: 2000, widthMm: 2000 }, // 4 m²
      ],
    }
    expect(roomAreaM2(room)).toBeCloseTo(16, 5)
  })

  it('empty room returns 0', () => {
    expect(roomAreaM2({ rectangles: [] })).toBe(0)
  })
})

describe('roomPerimeterMm', () => {
  it('uses override when provided', () => {
    const room = {
      rectangles: [{ lengthMm: 4000, widthMm: 3000 }],
      perimeterOverrideMm: 15000,
    }
    expect(roomPerimeterMm(room)).toBe(15000)
  })

  it('falls back to first rectangle perimeter', () => {
    const room = {
      rectangles: [{ lengthMm: 4000, widthMm: 3000 }],
    }
    // 2 * (4000 + 3000) = 14000
    expect(roomPerimeterMm(room)).toBe(14000)
  })

  it('returns 0 for empty room', () => {
    expect(roomPerimeterMm({ rectangles: [] })).toBe(0)
  })
})
