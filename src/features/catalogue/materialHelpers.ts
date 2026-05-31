import type { Material, SellingFormat, MaterialType } from '../../domain/materials'
import type { Badge } from '../../ui/Badge'

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  carpet:          'Carpet',
  vinyl:           'Vinyl',
  laminate:        'Laminate',
  lvt:             'LVT',
  engineered_wood: 'Engineered Wood',
  wood:            'Solid Wood',
  underlay:        'Underlay',
  accessory:       'Accessory',
}

export const SELLING_FORMAT_LABELS: Record<SellingFormat, string> = {
  roll:   'Roll (linear m)',
  pack:   'Pack',
  area:   'Area (m²)',
  linear: 'Linear (m)',
  unit:   'Unit',
}

type BadgeColor = Parameters<typeof Badge>[0]['color']

export const TYPE_COLORS: Record<MaterialType, BadgeColor> = {
  carpet:          'blue',
  vinyl:           'green',
  laminate:        'amber',
  lvt:             'purple',
  engineered_wood: 'rose',
  wood:            'rose',
  underlay:        'gray',
  accessory: 'gray',
}

export const FORMAT_COLORS: Record<SellingFormat, BadgeColor> = {
  roll:   'blue',
  pack:   'green',
  area:   'amber',
  linear: 'purple',
  unit:   'gray',
}

/** Convert display £ string to integer pence. Returns NaN on bad input. */
export function poundsInputToPence(value: string): number {
  const n = parseFloat(value)
  if (isNaN(n)) return NaN
  return Math.round(n * 100)
}

/** Convert integer pence to display £ string with 2dp. */
export function penceToPoundsInput(pence: number): string {
  return (pence / 100).toFixed(2)
}

export interface MaterialFormValues {
  make: string
  range: string
  sku: string
  type: MaterialType
  sellingFormat: SellingFormat
  rollWidthM: string      // metres string, converted to mm on save
  coveragePerPackM2: string
  unitPricePounds: string
  supplier: string
  notes: string
}

export function defaultFormValues(): MaterialFormValues {
  return {
    make: '',
    range: '',
    sku: '',
    type: 'carpet',
    sellingFormat: 'roll',
    rollWidthM: '4',
    coveragePerPackM2: '2.20',
    unitPricePounds: '',
    supplier: '',
    notes: '',
  }
}

export function materialToFormValues(m: Material): MaterialFormValues {
  return {
    make: m.make,
    range: m.range,
    sku: m.sku,
    type: m.type,
    sellingFormat: m.sellingFormat,
    rollWidthM: m.rollWidthMm != null ? (m.rollWidthMm / 1000).toString() : '4',
    coveragePerPackM2: m.coveragePerPackM2 != null ? m.coveragePerPackM2.toFixed(2) : '2.20',
    unitPricePounds: penceToPoundsInput(m.unitPricePence),
    supplier: m.supplier ?? '',
    notes: m.notes ?? '',
  }
}

export interface FormErrors {
  make?: string
  range?: string
  unitPricePounds?: string
  rollWidthM?: string
  coveragePerPackM2?: string
}

export function validateForm(v: MaterialFormValues): FormErrors {
  const errors: FormErrors = {}
  if (!v.make.trim()) errors.make = 'Make is required'
  if (!v.range.trim()) errors.range = 'Range / product name is required'
  if (!v.unitPricePounds || isNaN(parseFloat(v.unitPricePounds)) || parseFloat(v.unitPricePounds) < 0) {
    errors.unitPricePounds = 'Enter a valid price'
  }
  if (v.sellingFormat === 'roll') {
    const w = parseFloat(v.rollWidthM)
    if (isNaN(w) || w <= 0) errors.rollWidthM = 'Enter a valid roll width in metres'
  }
  if (v.sellingFormat === 'pack') {
    const c = parseFloat(v.coveragePerPackM2)
    if (isNaN(c) || c <= 0) errors.coveragePerPackM2 = 'Enter coverage per pack in m²'
  }
  return errors
}

export function priceUnitForFormat(format: SellingFormat) {
  const map: Record<SellingFormat, Material['priceUnit']> = {
    roll:   'per_linear_m',
    pack:   'per_pack',
    area:   'per_m2',
    linear: 'per_linear_m',
    unit:   'per_unit',
  }
  return map[format]
}
