import { type WorkOrder, type FormWorkOrder } from './types.ts'
import api from '@/features/workOrders/data/workOrder.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { TableQuery } from '@/components/Table/hooks/useTableQuery'

export const workOrderKeys = resourceKeys('workOrders')

export const useWorkOrderMutations = () =>
  useMutations<WorkOrder, FormWorkOrder>(workOrderKeys, api, { batchDelete: true })

export const useWorkOrders = (query?: TableQuery) =>
  useQuery({
    queryKey: [...workOrderKeys.all, query?.page ?? 1, query?.perPage ?? null, query?.search ?? '', query?.sort ?? null],
    queryFn: () => api.getAll(query),
    placeholderData: keepPreviousData,      // keep the current page on screen while the next one loads
  })

export const useScheduledWorkOrders = (day: Date) =>
  useQuery({
    queryKey: [ ...workOrderKeys.all, 'scheduled', day.toISOString() ],
    queryFn: () => api.getAll(),
  })

/* One order, as it is now. `known`, the order as it was last seen, shows while it loads */
export const useWorkOrder = (known: WorkOrder) =>
  useQuery({
    queryKey: [ ...workOrderKeys.all, 'one', known.id ],
    queryFn: () => api.get(known.id),
    placeholderData: known,
  })

/* Every order, whatever its day, for the calendar to place */
export const useCalendarWorkOrders = () =>
  useQuery({
    queryKey: [ ...workOrderKeys.all, 'calendar' ],
    queryFn: () => api.getAll(),
  })
