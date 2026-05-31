import { describe, it, expect } from 'vitest'
import {
  calcRollSingleRect,
  calcRollMultiRect,
  calcPacks,
  calcArea,
  calcLinear,
  calcUnits,
  calcSteps,
} from './calculators'

// ─── §5.1 Roll goods ─────────────────────────────────────────────────────────

describe('calcRollSingleRect — §5.1 worked example', () => {
  // Room 4.2m × 3.5m, carpet roll 4.0m wide
  const rect = { lengthMm: 4200, widthMm: 3500 }
  const rollWidthMm = 4000

  it('chooses orientation A (0 seams, 4.2m length)', () => {
    const result = calcRollSingleRect(rect, rollWidthMm)
    expect(result.chosen.seams).toBe(0)
    expect(result.chosen.linearMetres).toBeCloseTo(4.2, 5)
  })

  it('orientation A: purchased area = 4.0 × 4.2 = 16.8 m²', () => {
    const result = calcRollSingleRect(rect, rollWidthMm)
    expect(result.orientationA.purchasedAreaM2).toBeCloseTo(16.8, 5)
  })

  it('actual area = 14.7 m²', () => {
    const result = calcRollSingleRect(rect, rollWidthMm)
    expect(result.actualAreaM2).toBeCloseTo(14.7, 5)
  })

  it('orientation B requires seam (room width 4.2 > roll 4.0)', () => {
    const result = calcRollSingleRect(rect, rollWidthMm)
    expect(result.orientationB.seams).toBeGreaterThan(0)
    expect(result.orientationB.drops).toBe(2)
  })
})

describe('calcRollSingleRect — room wider than roll', () => {
  // Room 5m × 3m, roll 4m wide → must use 2 drops
  it('returns 2 drops and 1 seam', () => {
    const rect = { lengthMm: 5000, widthMm: 3000 }
    const result = calcRollSingleRect(rect, 4000)
    // Orientation A: width=3000 ≤ 4000 → 0 seams
    expect(result.chosen.seams).toBe(0)
    // Orientation B: width=5000 > 4000 → 2 drops
    expect(result.orientationB.drops).toBe(2)
  })

  it('forces seams when both orientations need drops', () => {
    // 5m × 4.5m room, 4m roll — both orientations need drops
    const rect = { lengthMm: 5000, widthMm: 4500 }
    const result = calcRollSingleRect(rect, 4000)
    // A: width=4500 > 4000 → 2 drops, 1 seam; B: width=5000 > 4000 → 2 drops, 1 seam
    expect(result.orientationA.seams).toBe(1)
    expect(result.orientationB.seams).toBe(1)
  })
})

describe('calcRollSingleRect — 5m roll width covers most rooms without seam', () => {
  it('3.5m wide room on 5m roll: 0 seams', () => {
    const result = calcRollSingleRect({ lengthMm: 4000, widthMm: 3500 }, 5000)
    expect(result.chosen.seams).toBe(0)
  })
})

describe('calcRollMultiRect — L-shaped room', () => {
  it('sums two rectangles correctly', () => {
    const result = calcRollMultiRect(
      [
        { lengthMm: 4000, widthMm: 3000 },
        { lengthMm: 2000, widthMm: 2000 },
      ],
      4000,
    )
    expect(result.totalActualAreaM2).toBeCloseTo(16, 5)
    expect(result.perRect).toHaveLength(2)
  })
})

// ─── §5.2 Pack goods ─────────────────────────────────────────────────────────

describe('calcPacks — §5.2 worked example', () => {
  // 14.7 m², pack covers 2.2 m², straight lay 8%
  // 14.7 × 1.08 = 15.876, / 2.2 = 7.22 → 8 packs
  it('returns 8 packs', () => {
    const result = calcPacks(14.7, 2.2, 'straight')
    expect(result.packsNeeded).toBe(8)
  })

  it('area with waste = 14.7 × 1.08 ≈ 15.876', () => {
    const result = calcPacks(14.7, 2.2, 'straight')
    expect(result.areaWithWasteM2).toBeCloseTo(15.876, 3)
  })

  it('diagonal lay uses 12% waste', () => {
    const result = calcPacks(14.7, 2.2, 'diagonal')
    expect(result.wasteFactor).toBe(0.12)
    expect(result.packsNeeded).toBe(Math.ceil((14.7 * 1.12) / 2.2))
  })

  it('herringbone lay uses 15% waste', () => {
    const result = calcPacks(14.7, 2.2, 'herringbone')
    expect(result.wasteFactor).toBe(0.15)
  })

  it('accepts waste factor override', () => {
    const result = calcPacks(10, 2.5, 'straight', 0.2)
    expect(result.wasteFactor).toBe(0.2)
    expect(result.packsNeeded).toBe(Math.ceil((10 * 1.2) / 2.5))
  })

  it('always rounds up (never down)', () => {
    // Exactly 7 packs worth of area → 7, not 8
    const area = 7 * 2.2 / 1.08
    const result = calcPacks(area, 2.2, 'straight')
    expect(result.packsNeeded).toBe(7)
  })

  it('partial pack always rounds up to full pack', () => {
    // 7.001 packs worth → 8
    const area = (7 * 2.2 + 0.01) / 1.08
    const result = calcPacks(area, 2.2, 'straight')
    expect(result.packsNeeded).toBe(8)
  })
})

// ─── §5.3 Area goods ─────────────────────────────────────────────────────────

describe('calcArea', () => {
  it('applies waste factor and returns quantity', () => {
    const result = calcArea(10, 0.1)
    expect(result.quantityM2).toBeCloseTo(11, 5)
  })

  it('defaults to 10% waste', () => {
    const result = calcArea(10)
    expect(result.wasteFactor).toBe(0.1)
  })
})

// ─── §5.4 Linear goods ───────────────────────────────────────────────────────

describe('calcLinear', () => {
  it('rounds up to nearest whole metre', () => {
    // 14m perimeter → 14
    expect(calcLinear(14000).linearMetres).toBe(14)
    // 14001mm → 15
    expect(calcLinear(14001).linearMetres).toBe(15)
  })

  it('applies doorway deduction', () => {
    // 14000mm perimeter, 900mm doorway deduction
    expect(calcLinear(14000, 900).linearMetres).toBe(14)
    // 14000mm perimeter, 1001mm deduction → 12999mm → 13m
    expect(calcLinear(14000, 1001).linearMetres).toBe(13)
  })

  it('never returns negative', () => {
    expect(calcLinear(500, 1000).linearMetres).toBe(0)
  })
})

// ─── §5.5 Per-unit goods ─────────────────────────────────────────────────────

describe('calcUnits', () => {
  it('returns whole units, rounding up', () => {
    expect(calcUnits(3).quantity).toBe(3)
    expect(calcUnits(2.1).quantity).toBe(3)
  })
})

// ─── §5.6 Per-step goods ─────────────────────────────────────────────────────

describe('calcSteps', () => {
  it('returns the step count directly', () => {
    expect(calcSteps(13).steps).toBe(13)
    expect(calcSteps(0).steps).toBe(0)
  })
})
