import type { PersistedRecord } from '@/types'
import type { WorkOrder } from '@/features/workOrders/types.ts'
import type { Schedulable } from '@/features/schedulables/types'
import type { ServiceTemplate } from '@/features/serviceTemplates/types'
import type { InventoryItem } from '@/features/inventory/inventoryItems/types'
import type { InventoryCategory } from '@/features/inventoryCategories/types'

export type ServiceStatus = 'not_started' | 'in_progress' | 'paused' | 'completed' | 'cancelled'

export type Service =
  & PersistedRecord
  & Schedulable
  & {
    name: string,
    status: ServiceStatus,
    workOrder: WorkOrder,
    workOrderId: WorkOrder['id'],
    approvedAt: string
}

export type FormService = Omit<Partial<Service>, 'parent'>
/*
 * A service as a work order is written with it: from a template or made there and then. A made
 * one can be kept as a template, in a category
 */
export type NewService = {
  serviceTemplateId?: ServiceTemplate['id']
  name: string
  labourMinutes: number
  items: { inventoryItemId: InventoryItem['id'], quantity: number | null }[]
  saveAsTemplate?: boolean
  inventoryCategoryId?: InventoryCategory['id']
}

/* What a work order is written with about its services: new ones, and those it drops */
export type ServiceWrite = NewService | { id: Service['id'], remove: true }
