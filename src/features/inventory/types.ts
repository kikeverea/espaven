import type { UnitOfMeasure } from '@/features/unitsOfMeasure/types'
import type { PersistedRecord } from '@/types'

export type InventoryItem = PersistedRecord & {
  name: string
  stock: number
  sku?: string
  unitOfMeasure: UnitOfMeasure
  priceCents: number
  observations: string
}
export type FormInventoryItem = Partial<InventoryItem> & Record<string, unknown>

export type InventoryMovement = PersistedRecord & {
  movement: 'in' | 'out'
  amountDelta: number
  stockAfter: number
  unitCostCents: number
  createdAt: string
  inventoryItem: InventoryItem
}
export type FormInventoryMovement =
  & Omit<Partial<InventoryMovement>, 'id' | 'inventoryItem'>
  & { inventoryItem: InventoryItem }
