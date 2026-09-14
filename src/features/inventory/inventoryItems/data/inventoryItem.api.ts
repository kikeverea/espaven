import type { FormInventoryItem, InventoryItem } from '../types.ts'
import { createResource } from '@/api/resource.ts'

export default createResource<InventoryItem, FormInventoryItem>('/inventory_items')
