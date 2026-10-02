import type { PersistedRecord } from '@/types'
import type { WorkOrder } from '@/features/workOrders/types.ts'

export type Service =
  & PersistedRecord
  & {
    name: string,
    laborMinutes: number,
    status: string,
    workOrder: WorkOrder,
    approvedAt: string
}

export type FormService = Omit<Partial<Service>, 'parent'>