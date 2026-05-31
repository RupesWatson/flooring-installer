import type { Mm, M2 } from '../units'
import { mmToM2 } from '../units'
import type { Rectangle, Room } from './types'

/** Total area of a room in m² (sum of all rectangles). */
export function roomAreaM2(room: Pick<Room, 'rectangles'>): M2 {
  return room.rectangles.reduce(
    (sum, r) => sum + mmToM2(r.lengthMm, r.widthMm),
    0,
  )
}

/** Estimated perimeter of a single rectangle in mm. */
export function rectanglePerimeterMm(r: Rectangle): Mm {
  return 2 * (r.lengthMm + r.widthMm)
}

/**
 * Estimated room perimeter.
 * Uses perimeterOverrideMm if set (caller should always set it for L-shapes);
 * otherwise sums the bounding perimeter of the first rectangle only (simple
 * rooms). For multi-rectangle rooms the override is essential for correctness.
 */
export function roomPerimeterMm(room: Pick<Room, 'rectangles' | 'perimeterOverrideMm'>): Mm {
  if (room.perimeterOverrideMm != null) {
    return room.perimeterOverrideMm
  }
  if (room.rectangles.length === 0) return 0
  // Fallback: perimeter of the bounding box of the first (and usually only) rectangle
  return rectanglePerimeterMm(room.rectangles[0])
}
