import { db as defaultDb, type FlooringDb } from '../db'
import type { Material } from '../entities'
import type { MaterialType, SellingFormat } from '../../domain/materials'
import { newId } from '../utils'

export function createMaterialsRepo(db: FlooringDb) {
  return {
    async getAll(): Promise<Material[]> {
      // `make` is not a Dexie index, so sort in memory rather than via orderBy
      // (orderBy on a non-indexed keyPath throws SchemaError).
      const all = await db.materials.toArray()
      return all.sort((a, b) => a.make.localeCompare(b.make))
    },

    async getByType(type: MaterialType): Promise<Material[]> {
      return db.materials.where('type').equals(type).toArray()
    },

    async getByFormat(format: SellingFormat): Promise<Material[]> {
      return db.materials.where('sellingFormat').equals(format).toArray()
    },

    async get(id: string): Promise<Material | undefined> {
      return db.materials.get(id)
    },

    async create(data: Omit<Material, 'id'>): Promise<Material> {
      const material: Material = { ...data, id: newId() }
      await db.materials.add(material)
      return material
    },

    async update(id: string, data: Partial<Omit<Material, 'id'>>): Promise<void> {
      await db.materials.update(id, data)
    },

    async delete(id: string): Promise<void> {
      await db.materials.delete(id)
    },
  }
}

export const materialsRepo = createMaterialsRepo(defaultDb)
