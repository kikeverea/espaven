import type { ApiMapper } from '@/api/apiClient'
import { type ForbiddenApiFields, prepareForApi } from '@/api/entity.mapper'
import { camelize, snakeCase } from '@/lib/strings'
import type { FormWorkOrder, WorkOrder } from '@/features/workOrders/types'
import type { NewService, ServiceWrite } from '@/features/services/types'

export type ApiWorkOrder = Omit<WorkOrder, 'status'> & { status: string }

/* A service nested in its order, as Rails' accepts_nested_attributes_for takes it: new, or dropped */
type ApiServiceOut =
  | Omit<NewService, 'items'> & { itemsAttributes: NewService['items'] }
  | { id: number, _destroy: true }

export type ApiWorkOrderOut =
  Omit<Partial<WorkOrder>, 'id' | 'createdAt' | 'status'> & ForbiddenApiFields & {
    status?: string
    servicesAttributes?: ApiServiceOut[]
  }

const servicesAttributes = (services: ServiceWrite[]): ApiServiceOut[] =>
  services.map(service => {
    if ('remove' in service)
      return { id: service.id, _destroy: true }

    const { items, ...rest } = service
    return { ...rest, itemsAttributes: items }
  })

export const workOrderMapper: ApiMapper<WorkOrder, ApiWorkOrder, ApiWorkOrderOut> = {
  toApi: workOrder => {
    const { status, services, ...rest } = prepareForApi<WorkOrder, ApiWorkOrderOut & Pick<FormWorkOrder, 'services'>>(workOrder)

    return {
      ...rest,
      ...(status && { status: snakeCase(status) }),
      ...(services && { servicesAttributes: servicesAttributes(services) }),
    }
  },
  fromApi: ({ status, ...workOrder }) => ({ ...workOrder, status: camelize(status) }) as WorkOrder,
}
