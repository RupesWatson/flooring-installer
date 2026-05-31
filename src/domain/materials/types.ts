import type { Mm, Pence } from '../units'

export type MaterialType =
  | 'carpet'
  | 'vinyl'
  | 'laminate'
  | 'lvt'
  | 'wood'
  | 'underlay'
  | 'accessory'

export type SellingFormat = 'roll' | 'pack' | 'area' | 'linear' | 'unit'

export type LayPattern = 'straight' | 'diagonal' | 'herringbone'

export const DEFAULT_WASTE_FACTORS: Record<LayPattern, number> = {
  straight: 0.08,
  diagonal: 0.12,
  herringbone: 0.15,
}

/** Price unit determines what unitPricePence refers to. */
export type PriceUnit = 'per_m2' | 'per_linear_m' | 'per_unit' | 'per_pack'

export interface Material {
  id: string
  make: string
  range: string
  sku: string
  type: MaterialType
  sellingFormat: SellingFormat
  /** Required for roll goods */
  rollWidthMm?: Mm
  /** m² coverage per pack — required for pack goods */
  coveragePerPackM2?: number
  unitPricePence: Pence
  priceUnit: PriceUnit
  supplier?: string
  notes?: string
}
