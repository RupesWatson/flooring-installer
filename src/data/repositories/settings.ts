import { db as defaultDb, type FlooringDb } from '../db'
import type { BusinessSettings } from '../entities'
import { DEFAULT_BUSINESS_SETTINGS } from '../../domain/pricing'

const SETTINGS_ID = 'settings' as const

export function createSettingsRepo(db: FlooringDb) {
  return {
    async get(): Promise<BusinessSettings> {
      const record = await db.settings.get(SETTINGS_ID)
      if (!record) return { ...DEFAULT_BUSINESS_SETTINGS }
      const { id: _id, ...settings } = record
      return settings
    },

    async save(settings: BusinessSettings): Promise<void> {
      await db.settings.put({ id: SETTINGS_ID, ...settings })
    },

    async ensureDefaults(): Promise<BusinessSettings> {
      const existing = await db.settings.get(SETTINGS_ID)
      if (!existing) {
        await db.settings.put({ id: SETTINGS_ID, ...DEFAULT_BUSINESS_SETTINGS })
      }
      return this.get()
    },
  }
}

export const settingsRepo = createSettingsRepo(defaultDb)
