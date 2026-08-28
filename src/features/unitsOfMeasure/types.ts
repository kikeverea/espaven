import type { Record } from '@/types'
import type { InventoryItem } from '@/features/inventory/types.ts'

export type UnitOfMeasure = Record & {
  name: string
}
export type FormUnitOfMeasure = Omit<Partial<InventoryItem>, 'id'>