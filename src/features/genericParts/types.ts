import type { PersistedRecord } from '@/types'
import type { InventoryCategory } from '@/features/inventoryCategories/types.ts'

export type GenericPart =
  PersistedRecord &
  {
    name: string
    inventoryCategory: InventoryCategory
  }
export type FormGenericPart = Partial<GenericPart>