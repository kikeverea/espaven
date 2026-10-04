import type { ApiMapper } from '@/api/apiClient'
import { type ForbiddenApiFields, prepareForApi } from '@/api/entity.mapper'
import { camelize, snakeCase } from '@/lib/strings'
import type { WorkOrder } from '@/features/workOrders/types'

export type ApiWorkOrder = Omit<WorkOrder, 'status'> & { status: string }
export type ApiWorkOrderOut = Omit<Partial<WorkOrder>, 'id' | 'createdAt' | 'status'> & ForbiddenApiFields & { status?: string }

export const workOrderMapper: ApiMapper<WorkOrder, ApiWorkOrder, ApiWorkOrderOut> = {
  toApi: workOrder => {
    const { status, ...rest } = prepareForApi<WorkOrder, ApiWorkOrderOut>(workOrder)
    return status ? { ...rest, status: snakeCase(status) } : rest
  },
  fromApi: ({ status, ...workOrder }) => ({ ...workOrder, status: camelize(status) }) as WorkOrder,
}
