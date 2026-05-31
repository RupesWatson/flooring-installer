import { roomAreaM2, roomPerimeterMm } from '../../domain/measurement'
import type { Room } from '../../domain/measurement'
import {
  calcRollMultiRect, calcPacks, calcArea, calcLinear, calcUnits, calcSteps,
} from '../../domain/materials'
import type { Material, LayPattern } from '../../domain/materials'
import { buildQuoteLine } from '../../domain/pricing'
import type { BusinessSettings, QuoteLine } from '../../domain/pricing'
import { newId } from '../../data/utils'

interface Options {
  layPattern?: LayPattern
  doorwayDeductionMm?: number
  unitCount?: number       // for 'unit' format
}

export function computeMaterialLine(
  room: Room,
  material: Material,
  settings: BusinessSettings,
  opts: Options = {},
): QuoteLine {
  const { layPattern = 'straight', doorwayDeductionMm = 0, unitCount = 1 } = opts
  const area = roomAreaM2(room)
  const perimMm = roomPerimeterMm(room)

  let quantity: number
  let unit: string
  let notes: string | undefined
  let wasteApplied = false

  switch (material.sellingFormat) {
    case 'roll': {
      const r = calcRollMultiRect(room.rectangles, material.rollWidthMm!)
      quantity = r.totalLinearMetres
      unit = 'lin m'
      notes = `${r.totalSeams} seam${r.totalSeams !== 1 ? 's' : ''} · ${r.totalPurchasedAreaM2.toFixed(2)} m² purchased · ${r.totalActualAreaM2.toFixed(2)} m² actual`
      break
    }
    case 'pack': {
      const wasteKey = ('defaultWasteFactor' + layPattern.charAt(0).toUpperCase() + layPattern.slice(1)) as keyof BusinessSettings
      const wasteFactor = (settings[wasteKey] ?? settings.defaultWasteFactorStraight) as number
      const r = calcPacks(area, material.coveragePerPackM2!, layPattern, wasteFactor)
      quantity = r.packsNeeded
      unit = 'packs'
      wasteApplied = true
      notes = `${area.toFixed(2)} m² + ${(wasteFactor * 100).toFixed(0)}% = ${r.areaWithWasteM2.toFixed(2)} m² ÷ ${material.coveragePerPackM2} m²/pack`
      break
    }
    case 'area': {
      const r = calcArea(area)
      quantity = Math.ceil(r.quantityM2 * 100) / 100
      unit = 'm²'
      wasteApplied = true
      break
    }
    case 'linear': {
      const r = calcLinear(perimMm, doorwayDeductionMm)
      quantity = r.linearMetres
      unit = 'm'
      break
    }
    case 'unit': {
      const r = calcUnits(unitCount)
      quantity = r.quantity
      unit = 'units'
      break
    }
    default:
      quantity = 1; unit = 'unit'
  }

  return buildQuoteLine({
    id: newId(),
    kind: 'material',
    description: `${material.make} — ${material.range}`,
    roomId: room.id,
    materialId: material.id,
    computedQuantity: quantity,
    unit,
    unitPricePence: material.unitPricePence,
    wasteApplied,
    notes,
  })
}

export function computeLabourLine(room: Room, ratePerM2Pence: number): QuoteLine {
  const area = roomAreaM2(room)
  const qty = Math.ceil(area * 100) / 100
  return buildQuoteLine({
    id: newId(), kind: 'labour',
    description: `Labour — ${room.name}`,
    roomId: room.id,
    computedQuantity: qty, unit: 'm²',
    unitPricePence: ratePerM2Pence,
    wasteApplied: false,
  })
}

export function computeStairLabourLine(room: Room, ratePerStepPence: number): QuoteLine {
  const r = calcSteps(room.stairSteps)
  return buildQuoteLine({
    id: newId(), kind: 'labour',
    description: `Stair labour — ${room.name}`,
    roomId: room.id,
    computedQuantity: r.steps, unit: 'steps',
    unitPricePence: ratePerStepPence,
    wasteApplied: false,
  })
}

export function customLine(description: string, kind: QuoteLine['kind'], qty: number, unit: string, unitPricePence: number): QuoteLine {
  return buildQuoteLine({ id: newId(), kind, description, computedQuantity: qty, unit, unitPricePence, wasteApplied: false })
}
