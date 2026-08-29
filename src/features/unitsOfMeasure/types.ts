import type { PersistedRecord } from '@/types'
import type { InventoryItem } from '@/features/inventory/types.ts'

export type UnitOfMeasure = PersistedRecord & {
  name: string
}
export type FormUnitOfMeasure = Omit<Partial<InventoryItem>, 'id'>