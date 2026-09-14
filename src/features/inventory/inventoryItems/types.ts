import type { PersistedRecord } from '@/types'
import type { InventoryCategory } from '@/features/inventoryCategories/types'
import type { UnitOfMeasure } from '@/features/unitsOfMeasure/types'

export type InventoryItem = PersistedRecord & {
  name: string
  stock: number
  sku?: string
  priceCents: number
  observations?: string
  unitOfMeasure: UnitOfMeasure
  inventoryCategory: InventoryCategory
}
export type FormInventoryItem = Partial<InventoryItem> & Record<string, unknown>