import type { Pence } from '../units'
import { addVat, vatPortion } from '../units'
import type { QuoteLine, QuoteTotals, BusinessSettings } from './types'

/**
 * Compute the lineTotalPence for a line.
 * All arithmetic stays in integer pence.
 */
export function computeLineTotal(
  computedQuantity: number,
  unitPricePence: Pence,
): Pence {
  return Math.round(computedQuantity * unitPricePence)
}

/**
 * Build a QuoteLine with its total calculated.
 * Input quantity should already be rounded up to purchasable units.
 */
export function buildQuoteLine(
  partial: Omit<QuoteLine, 'lineTotalPence'>,
): QuoteLine {
  return {
    ...partial,
    lineTotalPence: computeLineTotal(partial.computedQuantity, partial.unitPricePence),
  }
}

/** Sum a set of lines, apply VAT if registered, enforce minimum charge. */
export function computeTotals(
  lines: QuoteLine[],
  settings: Pick<BusinessSettings, 'vatRegistered' | 'vatRatePercent' | 'minimumChargePence'>,
): QuoteTotals {
  const rawSubtotal = lines.reduce((s, l) => s + l.lineTotalPence, 0)
  const subtotalPence = Math.max(rawSubtotal, settings.minimumChargePence)

  if (!settings.vatRegistered) {
    return {
      subtotalPence,
      vatPence: 0,
      grandTotalPence: subtotalPence,
      vatRatePercent: 0,
      vatRegistered: false,
    }
  }

  const grandTotalPence = addVat(subtotalPence, settings.vatRatePercent)
  const vatPence = vatPortion(grandTotalPence, settings.vatRatePercent)

  return {
    subtotalPence,
    vatPence,
    grandTotalPence,
    vatRatePercent: settings.vatRatePercent,
    vatRegistered: true,
  }
}

/**
 * Present totals inclusive or exclusive of VAT.
 * Switching this NEVER changes the stored canonical totals.
 */
export function presentTotals(
  totals: QuoteTotals,
  vatInclusiveDisplay: boolean,
): { displaySubtotal: Pence; displayVat: Pence; displayTotal: Pence } {
  if (!totals.vatRegistered || vatInclusiveDisplay) {
    return {
      displaySubtotal: totals.subtotalPence,
      displayVat: totals.vatPence,
      displayTotal: totals.grandTotalPence,
    }
  }
  // Exclusive display: show ex-VAT subtotal, VAT as separate line
  return {
    displaySubtotal: totals.subtotalPence,
    displayVat: totals.vatPence,
    displayTotal: totals.grandTotalPence,
  }
}
