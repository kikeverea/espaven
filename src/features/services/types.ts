import type { PersistedRecord } from '@/types'
import type { WorkOrder } from '@/features/workOrders/types.ts'
import type { Schedulable } from '@/features/schedulables/types'

export type ServiceStatus = 'not_started' | 'in_progress' | 'paused' | 'completed' | 'cancelled'

export type Service =
  & PersistedRecord
  & Schedulable
  & {
    name: string,
    laborMinutes: number,
    expectedMinutes: number | null,
    status: ServiceStatus,
    workOrder: WorkOrder,
    workOrderId: WorkOrder['id'],
    approvedAt: string
}

export type FormService = Omit<Partial<Service>, 'parent'>