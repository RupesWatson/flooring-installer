import { describe, it, expect } from 'vitest'
import {
  mmToM,
  mToMm,
  mmToFeet,
  feetInchesToMm,
  mmToFeetAndInches,
  mmToM2,
  m2ToFt2,
  ft2ToM2,
  penceToPounds,
  poundsToPence,
  addVat,
  vatPortion,
  removeVat,
  formatPence,
} from './conversions'

describe('length conversions', () => {
  it('mmToM round-trips', () => {
    expect(mmToM(1000)).toBe(1)
    expect(mmToM(4200)).toBeCloseTo(4.2, 10)
  })

  it('mToMm round-trips', () => {
    expect(mToMm(1)).toBe(1000)
    expect(mToMm(4.2)).toBe(4200)
  })

  it('mm <-> m round-trip is lossless for whole mm values', () => {
    const originalMm = 3456
    expect(mToMm(mmToM(originalMm))).toBe(originalMm)
  })

  it('mmToFeet', () => {
    expect(mmToFeet(304.8)).toBeCloseTo(1, 5)
    expect(mmToFeet(914.4)).toBeCloseTo(3, 5)
  })

  it('feetInchesToMm: 6 feet = 1828.8mm → rounded to 1829', () => {
    expect(feetInchesToMm(6, 0)).toBe(1829)
  })

  it('feetInchesToMm: 5 feet 6 inches', () => {
    expect(feetInchesToMm(5, 6)).toBe(Math.round(5 * 304.8 + 6 * 25.4))
  })

  it('mmToFeetAndInches round-trip within 1mm', () => {
    const mm = 3500
    const { feet, inches } = mmToFeetAndInches(mm)
    const back = feetInchesToMm(feet, inches)
    expect(Math.abs(back - mm)).toBeLessThanOrEqual(2)
  })

  it('feetInchesToMm -> mmToFeetAndInches round-trip', () => {
    const { feet, inches } = mmToFeetAndInches(feetInchesToMm(10, 6))
    expect(feet).toBe(10)
    expect(inches).toBe(6)
  })
})

describe('area conversions', () => {
  it('mmToM2: 4200 × 3500 = 14.7 m²', () => {
    expect(mmToM2(4200, 3500)).toBeCloseTo(14.7, 5)
  })

  it('m2 <-> ft2 round-trip', () => {
    const m2 = 14.7
    expect(ft2ToM2(m2ToFt2(m2))).toBeCloseTo(m2, 10)
  })
})

describe('money conversions', () => {
  it('penceToPounds', () => {
    expect(penceToPounds(1000)).toBe(10)
    expect(penceToPounds(150)).toBe(1.5)
  })

  it('poundsToPence', () => {
    expect(poundsToPence(10)).toBe(1000)
    expect(poundsToPence(1.5)).toBe(150)
    // Floating point edge case: should round correctly
    expect(poundsToPence(0.1 + 0.2)).toBe(30)
  })

  it('addVat at 20%', () => {
    expect(addVat(1000, 20)).toBe(1200)
    expect(addVat(100, 20)).toBe(120)
  })

  it('vatPortion at 20%', () => {
    expect(vatPortion(1200, 20)).toBe(200)
  })

  it('removeVat at 20%', () => {
    expect(removeVat(1200, 20)).toBe(1000)
  })

  it('addVat + removeVat round-trips for round amounts', () => {
    const pence = 5000
    expect(removeVat(addVat(pence, 20), 20)).toBe(pence)
  })

  it('formatPence outputs GBP', () => {
    expect(formatPence(1234)).toBe('£12.34')
    expect(formatPence(100000)).toBe('£1,000.00')
  })
})
