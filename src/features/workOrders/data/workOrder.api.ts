import type { FormWorkOrder, WorkOrder } from '../types'
import { createResource } from '@/api/resource.ts'
import { type ApiWorkOrder, type ApiWorkOrderOut, workOrderMapper } from '@/features/workOrders/data/workOrder.mapper'

export default createResource<WorkOrder, FormWorkOrder, ApiWorkOrder, ApiWorkOrderOut>('/work_orders', workOrderMapper)
