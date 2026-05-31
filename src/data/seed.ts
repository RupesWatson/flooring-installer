import { materialsRepo } from './repositories/materials'
import { SEED_CATALOGUE, getSeedStats } from './seedCatalogue'

export { getSeedStats }

/**
 * Load the seed catalogue into the database.
 * Skips products whose SKU already exists — safe to call multiple times.
 * Returns counts of added vs skipped.
 */
export async function seedCatalogue(
  onProgress?: (loaded: number, total: number) => void,
): Promise<{ added: number; skipped: number }> {
  const existing = await materialsRepo.getAll()
  const existingSkus = new Set(existing.map(m => m.sku))

  let added = 0
  let skipped = 0
  const total = SEED_CATALOGUE.length

  for (let i = 0; i < SEED_CATALOGUE.length; i++) {
    const product = SEED_CATALOGUE[i]
    if (existingSkus.has(product.sku)) {
      skipped++
    } else {
      await materialsRepo.create(product)
      added++
    }
    onProgress?.(i + 1, total)
  }

  return { added, skipped }
}
