import type { Pence } from '../units'

export type QuoteLineKind =
  | 'material'
  | 'labour'
  | 'prep'
  | 'accessory'
  | 'disposal'

export type QuoteStatus = 'draft' | 'sent' | 'accepted'

export interface QuoteLine {
  id: string
  kind: QuoteLineKind
  description: string
  /** Optional foreign keys — not resolved at domain layer */
  roomId?: string
  materialId?: string
  computedQuantity: number
  unit: string
  unitPricePence: Pence
  lineTotalPence: Pence
  wasteApplied: boolean
  notes?: string
}

export interface QuoteTotals {
  subtotalPence: Pence
  vatPence: Pence
  grandTotalPence: Pence
  vatRatePercent: number
  vatRegistered: boolean
}

export interface BusinessSettings {
  name: string
  logoDataUrl?: string
  brandColourPrimary: string
  brandColourSecondary: string
  vatRegistered: boolean
  vatRatePercent: number
  defaultUnitSystem: import('../units').UnitSystem
  defaultWasteFactorStraight: number
  defaultWasteFactorDiagonal: number
  defaultWasteFactorHerringbone: number
  labourRatePerM2Pence: Pence
  labourRatePerStepPence: Pence
  minimumChargePence: Pence
  defaultTermsText: string
}

/** Seam defined for future supplier price integration — not implemented in v1. */
export interface PriceProvider {
  getPrice(sku: string): Promise<Pence | null>
}
