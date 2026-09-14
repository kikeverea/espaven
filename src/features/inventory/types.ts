import type { PersistedRecord } from '@/types'
import type { InventoryItem } from '@/features/inventory/inventoryItems/types.ts'

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
