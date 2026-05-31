import type { BusinessSettings } from './types'
import { poundsToPence } from '../units'

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  name: 'My Flooring Business',
  brandColourPrimary: '#1e3a5f',
  brandColourSecondary: '#e07b22',
  vatRegistered: true,
  vatRatePercent: 20,
  defaultUnitSystem: 'metric',
  defaultWasteFactorStraight: 0.08,
  defaultWasteFactorDiagonal: 0.12,
  defaultWasteFactorHerringbone: 0.15,
  labourRatePerM2Pence: poundsToPence(5),
  labourRatePerStepPence: poundsToPence(15),
  minimumChargePence: poundsToPence(150),
  defaultTermsText:
    'Payment due within 14 days of invoice. Materials remain the property of the installer until paid in full.',
}
