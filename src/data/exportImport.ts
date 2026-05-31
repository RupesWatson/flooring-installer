import { db as defaultDb, type FlooringDb } from './db'
import type { SettingsRecord } from './db'
import type { Customer, Job, Material, Quote } from './entities'

export interface ExportPayload {
  version: 1
  exportedAt: number
  settings: SettingsRecord | undefined
  customers: Customer[]
  jobs: Job[]
  materials: Material[]
  quotes: Quote[]
}

export function createExportImport(db: FlooringDb) {
  return {
    async exportData(): Promise<string> {
      const [settings, customers, jobs, materials, quotes] = await Promise.all([
        db.settings.get('settings'),
        db.customers.toArray(),
        db.jobs.toArray(),
        db.materials.toArray(),
        db.quotes.toArray(),
      ])
      const payload: ExportPayload = {
        version: 1,
        exportedAt: Date.now(),
        settings,
        customers,
        jobs,
        materials,
        quotes,
      }
      return JSON.stringify(payload, null, 2)
    },

    async importData(json: string): Promise<void> {
      const payload: ExportPayload = JSON.parse(json)
      if (payload.version !== 1) {
        throw new Error(`Unsupported backup version: ${payload.version}`)
      }
      await db.transaction(
        'rw',
        [db.settings, db.customers, db.jobs, db.materials, db.quotes],
        async () => {
          await db.settings.clear()
          await db.customers.clear()
          await db.jobs.clear()
          await db.materials.clear()
          await db.quotes.clear()
          if (payload.settings) await db.settings.put(payload.settings)
          if (payload.customers.length) await db.customers.bulkPut(payload.customers)
          if (payload.jobs.length) await db.jobs.bulkPut(payload.jobs)
          if (payload.materials.length) await db.materials.bulkPut(payload.materials)
          if (payload.quotes.length) await db.quotes.bulkPut(payload.quotes)
        },
      )
    },
  }
}

export function downloadExport(json: string): void {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `flooring-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const _defaultIo = createExportImport(defaultDb)
export const exportData = _defaultIo.exportData.bind(_defaultIo)
export const importData = _defaultIo.importData.bind(_defaultIo)
