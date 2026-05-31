import type { Mm } from '../units'

export const UK_ROOM_PRESETS = [
  'Living room',
  'Lounge',
  'Dining room',
  'Kitchen',
  'Hallway',
  'Landing',
  'Stairs',
  'Master bedroom',
  'Bedroom 2',
  'Bedroom 3',
  'Bedroom 4',
  'Bathroom',
  'En-suite',
  'Box room',
  'Study',
  'Conservatory',
  'Utility',
  'Cloakroom/WC',
  'Garage',
  'Custom',
] as const

export type RoomPreset = (typeof UK_ROOM_PRESETS)[number]

export interface Rectangle {
  lengthMm: Mm
  widthMm: Mm
}

export interface Room {
  id: string
  name: string
  type: RoomPreset
  rectangles: Rectangle[]
  stairSteps: number
  /** User-supplied override for gripper/linear calculations */
  perimeterOverrideMm?: Mm
  notes?: string
}
