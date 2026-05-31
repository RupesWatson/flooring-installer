import type { Mm, M2, Pence } from './types'

// ─── Length ──────────────────────────────────────────────────────────────────

const MM_PER_INCH = 25.4
const MM_PER_FOOT = MM_PER_INCH * 12

export function mmToM(mm: Mm): number {
  return mm / 1000
}

export function mToMm(m: number): Mm {
  return Math.round(m * 1000)
}

export function mmToFeet(mm: Mm): number {
  return mm / MM_PER_FOOT
}

export function mmToInches(mm: Mm): number {
  return mm / MM_PER_INCH
}

/** Convert feet + inches to mm (round to nearest mm). */
export function feetInchesToMm(feet: number, inches = 0): Mm {
  return Math.round((feet * MM_PER_FOOT) + (inches * MM_PER_INCH))
}

/** Split mm into { feet, inches } — inches rounded to nearest 1/8". */
export function mmToFeetAndInches(mm: Mm): { feet: number; inches: number } {
  const totalInches = mm / MM_PER_INCH
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round((totalInches % 12) * 8) / 8
  return { feet, inches }
}

// ─── Area ────────────────────────────────────────────────────────────────────

/** Square metres from two mm dimensions. */
export function mmToM2(lengthMm: Mm, widthMm: Mm): M2 {
  return (lengthMm / 1000) * (widthMm / 1000)
}

const M2_PER_FT2 = 0.09290304

export function m2ToFt2(m2: M2): number {
  return m2 / M2_PER_FT2
}

export function ft2ToM2(ft2: number): M2 {
  return ft2 * M2_PER_FT2
}

// ─── Money ───────────────────────────────────────────────────────────────────

export function penceToPounds(pence: Pence): number {
  return pence / 100
}

export function poundsToPence(pounds: number): Pence {
  return Math.round(pounds * 100)
}

/** Format pence as a GBP display string, e.g. "£1,234.56" */
export function formatPence(pence: Pence): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence / 100)
}

/** Add VAT to a pence amount. Returns integer pence. */
export function addVat(pence: Pence, vatRatePercent: number): Pence {
  return Math.round(pence * (1 + vatRatePercent / 100))
}

/** Extract the VAT portion from a VAT-inclusive pence amount. */
export function vatPortion(inclusivePence: Pence, vatRatePercent: number): Pence {
  const rate = vatRatePercent / 100
  return Math.round(inclusivePence * (rate / (1 + rate)))
}

/** Remove VAT from a VAT-inclusive pence amount. */
export function removeVat(inclusivePence: Pence, vatRatePercent: number): Pence {
  return inclusivePence - vatPortion(inclusivePence, vatRatePercent)
}
