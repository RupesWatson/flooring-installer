import { db as defaultDb, type FlooringDb } from '../db'
import type { Customer } from '../entities'
import { newId, now } from '../utils'

export function createCustomersRepo(db: FlooringDb) {
  return {
    async getAll(): Promise<Customer[]> {
      return db.customers.orderBy('name').toArray()
    },

    async get(id: string): Promise<Customer | undefined> {
      return db.customers.get(id)
    },

    async create(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
      const customer: Customer = { ...data, id: newId(), createdAt: now(), updatedAt: now() }
      await db.customers.add(customer)
      return customer
    },

    async update(id: string, data: Partial<Omit<Customer, 'id' | 'createdAt'>>): Promise<void> {
      await db.customers.update(id, { ...data, updatedAt: now() })
    },

    async delete(id: string): Promise<void> {
      await db.transaction('rw', [db.customers, db.jobs, db.quotes], async () => {
        await db.customers.delete(id)
        const jobs = await db.jobs.where('customerId').equals(id).toArray()
        for (const job of jobs) {
          await db.quotes.where('jobId').equals(job.id).delete()
        }
        await db.jobs.where('customerId').equals(id).delete()
        await db.quotes.where('customerId').equals(id).delete()
      })
    },
  }
}

export const customersRepo = createCustomersRepo(defaultDb)
