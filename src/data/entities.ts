import type { Room } from '../domain/measurement'
import type { QuoteLine, QuoteTotals, QuoteStatus, BusinessSettings } from '../domain/pricing'

export type { BusinessSettings }

export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  createdAt: number
  updatedAt: number
}

export interface Job {
  id: string
  customerId: string
  address: string
  rooms: Room[]
  notes?: string
  createdAt: number
  updatedAt: number
}

import type { Material } from '../domain/materials'
export type { Material }

export interface Quote {
  id: string
  customerId: string
  jobId: string
  lines: QuoteLine[]
  totals: QuoteTotals
  status: QuoteStatus
  vatInclusiveDisplay: boolean
  notes?: string
  createdAt: number
  updatedAt: number
}
