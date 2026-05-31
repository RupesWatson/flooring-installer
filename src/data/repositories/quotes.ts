import { db as defaultDb, type FlooringDb } from '../db'
import type { Quote } from '../entities'
import type { QuoteStatus } from '../../domain/pricing'
import { newId, now } from '../utils'

export function createQuotesRepo(db: FlooringDb) {
  return {
    async getAll(): Promise<Quote[]> {
      return db.quotes.orderBy('createdAt').reverse().toArray()
    },

    async getByCustomer(customerId: string): Promise<Quote[]> {
      return db.quotes.where('customerId').equals(customerId).toArray()
    },

    async getByJob(jobId: string): Promise<Quote[]> {
      return db.quotes.where('jobId').equals(jobId).toArray()
    },

    async get(id: string): Promise<Quote | undefined> {
      return db.quotes.get(id)
    },

    async create(data: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quote> {
      const quote: Quote = { ...data, id: newId(), createdAt: now(), updatedAt: now() }
      await db.quotes.add(quote)
      return quote
    },

    async update(id: string, data: Partial<Omit<Quote, 'id' | 'createdAt'>>): Promise<void> {
      await db.quotes.update(id, { ...data, updatedAt: now() })
    },

    async updateStatus(id: string, status: QuoteStatus): Promise<void> {
      await db.quotes.update(id, { status, updatedAt: now() })
    },

    async delete(id: string): Promise<void> {
      await db.quotes.delete(id)
    },
  }
}

export const quotesRepo = createQuotesRepo(defaultDb)
