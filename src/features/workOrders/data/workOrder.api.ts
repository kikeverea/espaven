import type { FormWorkOrder, WorkOrder } from '../types'
import { createResource } from '@/api/resource.ts'

export default createResource<WorkOrder, FormWorkOrder>('/work_orders')
