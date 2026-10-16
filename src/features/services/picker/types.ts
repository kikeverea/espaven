import type { ServiceTemplate } from '@/features/serviceTemplates/types'
import type { InventoryItem } from '@/features/inventory/inventoryItems/types'
import type { InventoryCategory } from '@/features/inventoryCategories/types'
import type { Service } from '@/features/services/types'

/* A service of an order: one it has already, a template from the catalogue, or one made there and then */
export type PickedService =
  | { kind: 'existing', key: string, service: Service, labourMinutes: number }
  | { kind: 'template', key: string, template: ServiceTemplate, labourMinutes: number }
  | {
      kind: 'new'
      key: string
      name: string
      labourMinutes: number
      items: InventoryItem[]
      saveAsTemplate: boolean
      inventoryCategory?: InventoryCategory     // where it is kept, when it is
    }

/* A service being made: picked items and all, before it joins the order */
export type DraftService = Omit<Extract<PickedService, { kind: 'new' }>, 'kind' | 'key'>
