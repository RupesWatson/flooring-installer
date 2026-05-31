import { describe, it, expect } from 'vitest'
import { computeLineTotal, buildQuoteLine, computeTotals, presentTotals } from './engine'
import { addVat, removeVat } from '../units/conversions'
import type { QuoteLine, BusinessSettings } from './types'

const settings: BusinessSettings = {
  name: 'Test Co',
  brandColourPrimary: '#000',
  brandColourSecondary: '#fff',
  vatRegistered: true,
  vatRatePercent: 20,
  defaultUnitSystem: 'metric',
  defaultWasteFactorStraight: 0.08,
  defaultWasteFactorDiagonal: 0.12,
  defaultWasteFactorHerringbone: 0.15,
  labourRatePerM2Pence: 500,
  labourRatePerStepPence: 1500,
  minimumChargePence: 15000,
  defaultTermsText: '',
}

function makeLine(overrides: Partial<QuoteLine> = {}): QuoteLine {
  return {
    id: '1',
    kind: 'material',
    description: 'Carpet',
    computedQuantity: 8,
    unit: 'packs',
    unitPricePence: 2200,
    lineTotalPence: 17600,
    wasteApplied: true,
    ...overrides,
  }
}

describe('computeLineTotal', () => {
  it('multiplies quantity × unit price, rounds to pence', () => {
    expect(computeLineTotal(8, 2200)).toBe(17600)
    expect(computeLineTotal(4.2, 1000)).toBe(4200)
  })

  it('uses integer pence throughout', () => {
    // 3 packs at £11.11 each = 3333p (not 3333.3)
    expect(computeLineTotal(3, 1111)).toBe(3333)
  })
})

describe('buildQuoteLine', () => {
  it('computes lineTotalPence from quantity × unitPrice', () => {
    const line = buildQuoteLine({
      id: '1',
      kind: 'material',
      description: 'Test',
      computedQuantity: 10,
      unit: 'm²',
      unitPricePence: 1500,
      wasteApplied: false,
    })
    expect(line.lineTotalPence).toBe(15000)
  })
})

describe('computeTotals', () => {
  it('sums lines and applies 20% VAT', () => {
    const lines = [makeLine({ lineTotalPence: 10000 }), makeLine({ lineTotalPence: 5000 })]
    const totals = computeTotals(lines, settings)
    expect(totals.subtotalPence).toBe(15000)
    expect(totals.vatPence).toBe(3000)
    expect(totals.grandTotalPence).toBe(18000)
  })

  it('enforces minimum charge', () => {
    const lines = [makeLine({ lineTotalPence: 1000 })] // below minimum
    const totals = computeTotals(lines, settings)
    expect(totals.subtotalPence).toBe(settings.minimumChargePence)
  })

  it('no VAT when not registered', () => {
    const nonVat = { ...settings, vatRegistered: false }
    const lines = [makeLine({ lineTotalPence: 10000 })]
    const totals = computeTotals(lines, nonVat)
    expect(totals.vatPence).toBe(0)
    expect(totals.grandTotalPence).toBe(totals.subtotalPence)
    expect(totals.vatRegistered).toBe(false)
  })

  it('minimum charge does not trigger for zero-line quotes below floor', () => {
    const lines: QuoteLine[] = []
    const totals = computeTotals(lines, settings)
    expect(totals.subtotalPence).toBe(settings.minimumChargePence)
  })
})

describe('presentTotals — unit/VAT toggle never changes stored totals', () => {
  it('inclusive and exclusive presentations share the same grandTotal', () => {
    const lines = [makeLine({ lineTotalPence: 10000 })]
    const totals = computeTotals(lines, settings)
    const incl = presentTotals(totals, true)
    const excl = presentTotals(totals, false)
    expect(incl.displayTotal).toBe(excl.displayTotal)
    expect(incl.displayTotal).toBe(totals.grandTotalPence)
  })
})

describe('VAT arithmetic', () => {
  it('addVat then removing VAT is lossless for round amounts', () => {
    expect(removeVat(addVat(5000, 20), 20)).toBe(5000)
  })
})
