import type { FormInventoryCategory, InventoryCategory } from '../types'
import { createResource } from '@/api/resource.ts'

export default createResource<InventoryCategory, FormInventoryCategory>('/inventory_categories')
