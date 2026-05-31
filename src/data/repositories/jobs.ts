import { db as defaultDb, type FlooringDb } from '../db'
import type { Job } from '../entities'
import type { Room } from '../../domain/measurement'
import { newId, now } from '../utils'

export function createJobsRepo(db: FlooringDb) {
  return {
    async getAll(): Promise<Job[]> {
      return db.jobs.orderBy('createdAt').reverse().toArray()
    },

    async getByCustomer(customerId: string): Promise<Job[]> {
      return db.jobs.where('customerId').equals(customerId).toArray()
    },

    async get(id: string): Promise<Job | undefined> {
      return db.jobs.get(id)
    },

    async create(data: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
      const job: Job = { ...data, id: newId(), createdAt: now(), updatedAt: now() }
      await db.jobs.add(job)
      return job
    },

    async update(id: string, data: Partial<Omit<Job, 'id' | 'createdAt'>>): Promise<void> {
      await db.jobs.update(id, { ...data, updatedAt: now() })
    },

    async saveRooms(jobId: string, rooms: Room[]): Promise<void> {
      await db.jobs.update(jobId, { rooms, updatedAt: now() })
    },

    async delete(id: string): Promise<void> {
      await db.transaction('rw', [db.jobs, db.quotes], async () => {
        await db.jobs.delete(id)
        await db.quotes.where('jobId').equals(id).delete()
      })
    },
  }
}

export const jobsRepo = createJobsRepo(defaultDb)
