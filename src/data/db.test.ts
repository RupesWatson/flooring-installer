import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { FlooringDb } from './db'
import { createSettingsRepo } from './repositories/settings'
import { createCustomersRepo } from './repositories/customers'
import { createJobsRepo } from './repositories/jobs'
import { createMaterialsRepo } from './repositories/materials'
import { createQuotesRepo } from './repositories/quotes'
import { createExportImport } from './exportImport'
import { DEFAULT_BUSINESS_SETTINGS } from '../domain/pricing'

// Each test group gets a fresh in-memory db with a unique name
let db: FlooringDb
let settings: ReturnType<typeof createSettingsRepo>
let customers: ReturnType<typeof createCustomersRepo>
let jobs: ReturnType<typeof createJobsRepo>
let materials: ReturnType<typeof createMaterialsRepo>
let quotes: ReturnType<typeof createQuotesRepo>
let io: ReturnType<typeof createExportImport>

let dbSeq = 0
beforeEach(() => {
  db = new FlooringDb(`test-${++dbSeq}`)
  settings = createSettingsRepo(db)
  customers = createCustomersRepo(db)
  jobs = createJobsRepo(db)
  materials = createMaterialsRepo(db)
  quotes = createQuotesRepo(db)
  io = createExportImport(db)
})

describe('settingsRepo', () => {
  it('returns defaults when no record exists', async () => {
    const s = await settings.get()
    expect(s.vatRatePercent).toBe(DEFAULT_BUSINESS_SETTINGS.vatRatePercent)
    expect(s.vatRegistered).toBe(true)
  })

  it('saves and retrieves settings', async () => {
    await settings.save({ ...DEFAULT_BUSINESS_SETTINGS, name: 'Test Floors Ltd' })
    const s = await settings.get()
    expect(s.name).toBe('Test Floors Ltd')
  })

  it('ensureDefaults writes defaults if not present', async () => {
    const s = await settings.ensureDefaults()
    expect(s.name).toBe(DEFAULT_BUSINESS_SETTINGS.name)
  })
})

describe('customersRepo', () => {
  it('creates and retrieves a customer', async () => {
    const c = await customers.create({ name: 'John Smith', phone: '07700 900000' })
    expect(c.id).toBeTruthy()
    const found = await customers.get(c.id)
    expect(found?.name).toBe('John Smith')
  })

  it('updates a customer', async () => {
    const c = await customers.create({ name: 'Jane Doe' })
    await customers.update(c.id, { email: 'jane@example.com' })
    const updated = await customers.get(c.id)
    expect(updated?.email).toBe('jane@example.com')
  })

  it('lists all customers ordered by name', async () => {
    await customers.create({ name: 'Zara' })
    await customers.create({ name: 'Aaron' })
    const all = await customers.getAll()
    expect(all[0].name).toBe('Aaron')
    expect(all[1].name).toBe('Zara')
  })

  it('deletes customer and cascades to jobs and quotes', async () => {
    const c = await customers.create({ name: 'To Delete' })
    const j = await jobs.create({ customerId: c.id, address: '1 Test St', rooms: [] })
    await quotes.create({
      customerId: c.id,
      jobId: j.id,
      lines: [],
      totals: { subtotalPence: 0, vatPence: 0, grandTotalPence: 0, vatRatePercent: 20, vatRegistered: true },
      status: 'draft',
      vatInclusiveDisplay: true,
    })
    await customers.delete(c.id)
    expect(await customers.get(c.id)).toBeUndefined()
    expect(await jobs.get(j.id)).toBeUndefined()
    expect(await quotes.getByCustomer(c.id)).toHaveLength(0)
  })
})

describe('jobsRepo', () => {
  it('creates a job with rooms embedded', async () => {
    const c = await customers.create({ name: 'Owner' })
    const job = await jobs.create({
      customerId: c.id,
      address: '5 Oak Lane',
      rooms: [
        {
          id: 'r1',
          name: 'Living room',
          type: 'Living room',
          rectangles: [{ lengthMm: 4200, widthMm: 3500 }],
          stairSteps: 0,
        },
      ],
    })
    const found = await jobs.get(job.id)
    expect(found?.rooms).toHaveLength(1)
    expect(found?.rooms[0].rectangles[0].lengthMm).toBe(4200)
  })

  it('saves updated rooms', async () => {
    const c = await customers.create({ name: 'Owner2' })
    const job = await jobs.create({ customerId: c.id, address: '6 Pine Rd', rooms: [] })
    await jobs.saveRooms(job.id, [
      { id: 'r2', name: 'Kitchen', type: 'Kitchen', rectangles: [{ lengthMm: 3000, widthMm: 2500 }], stairSteps: 0 },
    ])
    const updated = await jobs.get(job.id)
    expect(updated?.rooms).toHaveLength(1)
  })

  it('data survives a db close and reopen', async () => {
    const c = await customers.create({ name: 'Persistent' })
    const dbName = (db as unknown as { name: string }).name ?? `test-${dbSeq}`
    await db.close()
    const db2 = new FlooringDb(dbName)
    const found = await db2.customers.get(c.id)
    expect(found?.name).toBe('Persistent')
    await db2.close()
  })
})

describe('materialsRepo', () => {
  it('creates and retrieves a material', async () => {
    const m = await materials.create({
      make: 'Cormar',
      range: 'Sensation',
      sku: 'SEN-001',
      type: 'carpet',
      sellingFormat: 'roll',
      rollWidthMm: 4000,
      unitPricePence: 2500,
      priceUnit: 'per_linear_m',
    })
    const found = await materials.get(m.id)
    expect(found?.rollWidthMm).toBe(4000)
  })

  it('getAll returns every material sorted by make (regression: make is not indexed)', async () => {
    expect(await materials.getAll()).toEqual([]) // must not throw on empty store
    await materials.create({ make: 'Xerox', range: 'B', sku: 'X1', type: 'carpet', sellingFormat: 'roll', unitPricePence: 1000, priceUnit: 'per_linear_m' })
    await materials.create({ make: 'Acme', range: 'Y', sku: 'A1', type: 'laminate', sellingFormat: 'pack', coveragePerPackM2: 2.2, unitPricePence: 3000, priceUnit: 'per_pack' })
    const all = await materials.getAll()
    expect(all.map(m => m.make)).toEqual(['Acme', 'Xerox'])
  })

  it('filters by type', async () => {
    await materials.create({ make: 'A', range: 'B', sku: 'C1', type: 'carpet', sellingFormat: 'roll', unitPricePence: 1000, priceUnit: 'per_linear_m' })
    await materials.create({ make: 'X', range: 'Y', sku: 'Z1', type: 'laminate', sellingFormat: 'pack', coveragePerPackM2: 2.2, unitPricePence: 3000, priceUnit: 'per_pack' })
    const carpets = await materials.getByType('carpet')
    expect(carpets.every(m => m.type === 'carpet')).toBe(true)
  })

  it('deletes a material', async () => {
    const m = await materials.create({ make: 'Del', range: 'X', sku: 'DEL1', type: 'vinyl', sellingFormat: 'roll', unitPricePence: 1000, priceUnit: 'per_linear_m' })
    await materials.delete(m.id)
    expect(await materials.get(m.id)).toBeUndefined()
  })
})

describe('quotesRepo', () => {
  it('creates a draft quote and updates its status', async () => {
    const c = await customers.create({ name: 'Q Customer' })
    const j = await jobs.create({ customerId: c.id, address: 'Q Addr', rooms: [] })
    const q = await quotes.create({
      customerId: c.id,
      jobId: j.id,
      lines: [],
      totals: { subtotalPence: 15000, vatPence: 3000, grandTotalPence: 18000, vatRatePercent: 20, vatRegistered: true },
      status: 'draft',
      vatInclusiveDisplay: true,
    })
    expect(q.status).toBe('draft')
    await quotes.updateStatus(q.id, 'sent')
    expect((await quotes.get(q.id))?.status).toBe('sent')
  })
})

describe('export / import', () => {
  it('round-trips all data through JSON', async () => {
    const c = await customers.create({ name: 'Export Me' })
    await jobs.create({ customerId: c.id, address: 'Export St', rooms: [] })

    const json = await io.exportData()
    const parsed = JSON.parse(json)
    expect(parsed.version).toBe(1)
    expect(parsed.customers).toHaveLength(1)
    expect(parsed.jobs).toHaveLength(1)

    // Wipe and re-import
    await db.customers.clear()
    await db.jobs.clear()
    await io.importData(json)

    const all = await customers.getAll()
    expect(all).toHaveLength(1)
    expect(all[0].name).toBe('Export Me')
  })

  it('rejects unknown backup versions', async () => {
    await expect(io.importData(JSON.stringify({ version: 99 }))).rejects.toThrow('Unsupported backup version')
  })
})
