import type { Mm, M2 } from '../units'
import { mmToM2 } from '../units'
import type { Rectangle } from '../measurement'
import type { LayPattern } from './types'
import { DEFAULT_WASTE_FACTORS } from './types'

// ─── 5.1 Roll goods ──────────────────────────────────────────────────────────

export interface RollOrientation {
  /** Linear metres of roll to purchase */
  linearMetres: number
  /** Number of seams required */
  seams: number
  /** Number of drops (strips cut from roll) */
  drops: number
  /** Purchased area in m² */
  purchasedAreaM2: M2
}

export interface RollResult {
  chosen: RollOrientation
  orientationA: RollOrientation
  orientationB: RollOrientation
  /** Actual room area (what is being covered) */
  actualAreaM2: M2
}

function rollOrientation(
  runLengthMm: Mm,
  runWidthMm: Mm,
  rollWidthMm: Mm,
): RollOrientation {
  if (runWidthMm <= rollWidthMm) {
    return {
      linearMetres: runLengthMm / 1000,
      seams: 0,
      drops: 1,
      purchasedAreaM2: mmToM2(rollWidthMm, runLengthMm),
    }
  }
  const drops = Math.ceil(runWidthMm / rollWidthMm)
  const linearMetres = (drops * runLengthMm) / 1000
  return {
    linearMetres,
    seams: drops - 1,
    drops,
    purchasedAreaM2: mmToM2(rollWidthMm * drops, runLengthMm),
  }
}

/**
 * Calculate roll quantity for a single rectangle.
 * Tries both orientations and picks fewest seams, then least linear length.
 */
export function calcRollSingleRect(rect: Rectangle, rollWidthMm: Mm): RollResult {
  const orientationA = rollOrientation(rect.lengthMm, rect.widthMm, rollWidthMm)
  const orientationB = rollOrientation(rect.widthMm, rect.lengthMm, rollWidthMm)

  const chosen = chooseBestOrientation(orientationA, orientationB)

  return {
    chosen,
    orientationA,
    orientationB,
    actualAreaM2: mmToM2(rect.lengthMm, rect.widthMm),
  }
}

function chooseBestOrientation(a: RollOrientation, b: RollOrientation): RollOrientation {
  if (a.seams !== b.seams) return a.seams < b.seams ? a : b
  return a.linearMetres <= b.linearMetres ? a : b
}

/**
 * Roll calculation across multiple rectangles (e.g. L-shaped room).
 * Each rectangle is calculated independently then summed — conservative but
 * correct for real-world cutting.
 */
export function calcRollMultiRect(rectangles: Rectangle[], rollWidthMm: Mm): {
  totalLinearMetres: number
  totalPurchasedAreaM2: M2
  totalActualAreaM2: M2
  totalSeams: number
  perRect: RollResult[]
} {
  const perRect = rectangles.map((r) => calcRollSingleRect(r, rollWidthMm))
  return {
    totalLinearMetres: perRect.reduce((s, r) => s + r.chosen.linearMetres, 0),
    totalPurchasedAreaM2: perRect.reduce((s, r) => s + r.chosen.purchasedAreaM2, 0),
    totalActualAreaM2: perRect.reduce((s, r) => s + r.actualAreaM2, 0),
    totalSeams: perRect.reduce((s, r) => s + r.chosen.seams, 0),
    perRect,
  }
}

// ─── 5.2 Pack goods ──────────────────────────────────────────────────────────

export interface PackResult {
  packsNeeded: number
  areaWithWasteM2: M2
  wasteFactor: number
}

export function calcPacks(
  areaM2: M2,
  coveragePerPackM2: number,
  layPattern: LayPattern = 'straight',
  wasteFactorOverride?: number,
): PackResult {
  const wasteFactor = wasteFactorOverride ?? DEFAULT_WASTE_FACTORS[layPattern]
  const areaWithWasteM2 = areaM2 * (1 + wasteFactor)
  const packsNeeded = Math.ceil(areaWithWasteM2 / coveragePerPackM2)
  return { packsNeeded, areaWithWasteM2, wasteFactor }
}

// ─── 5.3 Area goods ──────────────────────────────────────────────────────────

export interface AreaResult {
  quantityM2: M2
  wasteFactor: number
}

export function calcArea(areaM2: M2, wasteFactor = 0.1): AreaResult {
  return {
    quantityM2: areaM2 * (1 + wasteFactor),
    wasteFactor,
  }
}

// ─── 5.4 Linear goods ────────────────────────────────────────────────────────

export interface LinearResult {
  linearMetres: number
}

/** Linear quantity in metres, rounded up to nearest whole metre. */
export function calcLinear(perimeterMm: Mm, deductionMm = 0): LinearResult {
  const netMm = Math.max(0, perimeterMm - deductionMm)
  return { linearMetres: Math.ceil(netMm / 1000) }
}

// ─── 5.5 Per-unit goods ──────────────────────────────────────────────────────

export interface UnitResult {
  quantity: number
}

export function calcUnits(quantity: number): UnitResult {
  return { quantity: Math.ceil(quantity) }
}

// ─── 5.6 Per-step goods ──────────────────────────────────────────────────────

export interface StepResult {
  steps: number
}

export function calcSteps(stairSteps: number): StepResult {
  return { steps: stairSteps }
}
