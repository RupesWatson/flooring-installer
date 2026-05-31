export type UnitSystem = 'metric' | 'imperial'

/** Canonical length: integer millimetres */
export type Mm = number

/** Canonical area: square metres (float ok, derived from Mm) */
export type M2 = number

/** Canonical money: integer pence */
export type Pence = number

export type LengthUnit = 'mm' | 'm' | 'cm' | 'ft' | 'in'
export type AreaUnit = 'm2' | 'ft2'
