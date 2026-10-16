import type { PersistedRecord } from '@/types'

export type InventoryCategory =
  PersistedRecord &
  {
    name: string
    appliesSigaus?: boolean
    icon?: string                 // a lucide icon name, for the categories shown as tiles
  }
export type FormInventoryCategory = Partial<InventoryCategory>