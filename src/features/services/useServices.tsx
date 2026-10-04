import { type Service, type FormService } from './types'
import type { WorkOrder } from '@/features/workOrders/types'
import api from '@/features/services/data/service.api'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const serviceKeys = resourceKeys('services')

export const useServiceMutations = () =>
  useMutations<Service, FormService>(serviceKeys, api, { batchDelete: true })

export const useServices = (target: 'active' | 'discarded') =>
  useQuery({
    queryKey: serviceKeys.all,
    queryFn: () => api.getAll(),
    select: data => ({
      ...data,
      collection: data.collection.filter(service =>
        target === 'active'
          ? !service.discardedAt
          : !!service.discardedAt
      ),
    }),
  })

/* A work order's services, top level only: their parts come within them */
export const useWorkOrderServices = (workOrderId: WorkOrder['id']) =>
  useQuery({
    queryKey: [ ...serviceKeys.all, 'workOrder', workOrderId ],
    queryFn: () => api.getAll({}, { workOrderId }),
    select: data => data.collection,
  })
