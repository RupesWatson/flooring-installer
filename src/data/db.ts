import Dexie, { type Table } from 'dexie'
import type { Customer, Job, Material, Quote, BusinessSettings } from './entities'

/** Single-row settings table — always keyed by id = 'settings' */
export interface SettingsRecord extends BusinessSettings {
  id: 'settings'
}

export class FlooringDb extends Dexie {
  settings!: Table<SettingsRecord, string>
  customers!: Table<Customer, string>
  jobs!: Table<Job, string>
  materials!: Table<Material, string>
  quotes!: Table<Quote, string>

  constructor(name = 'flooring-installer') {
    super(name)

    this.version(1).stores({
      settings: 'id',
      customers: 'id, name, createdAt',
      jobs: 'id, customerId, createdAt',
      materials: 'id, type, sellingFormat',
      quotes: 'id, customerId, jobId, status, createdAt',
    })
  }
}

export const db = new FlooringDb()
