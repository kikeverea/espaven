import type { PersistedRecord } from '@/types'
import type { InventoryCategory } from '@/features/inventoryCategories/types'
import type { InventoryItem } from '@/features/inventory/inventoryItems/types'

/* An item a template uses up. Without a quantity, whatever the job takes */
export type ServiceTemplateItem = {
  inventoryItem: InventoryItem
  quantity?: number
}

/*
 * A service as the catalogue offers it. A template with children groups them: its labour is
 * theirs and it uses no items of its own. Services and items share their categories
 */
export type ServiceTemplate =
  & PersistedRecord
  & {
    name: string
    labourMinutes: number
    priceCents: number
    discardedAt?: string
    parent?: ServiceTemplate
    inventoryCategory?: InventoryCategory      // top level ones; children are in their parent's
    children?: ServiceTemplate[]
    items?: ServiceTemplateItem[]
  }

export type FormServiceTemplate = Omit<Partial<ServiceTemplate>, 'parent'>
