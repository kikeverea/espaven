import type { PersistedRecord } from '@/types'

export type InventoryCategory =
  PersistedRecord &
  {
    name: string
    appliesSigaus?: boolean
  }
export type FormInventoryCategory = Partial<InventoryCategory>