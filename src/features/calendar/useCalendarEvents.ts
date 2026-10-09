import type { FormWorkOrder, WorkOrder } from '@/features/workOrders/types'
import type { FormService, Service } from '@/features/services/types'
import type { Mutations } from '@/lib/mutations'
import { usePendingSave } from '@/features/workOrders/pendingSave'
import { calendarEvents } from '@/features/calendar/calendarEvents'

/*
 * The calendar's events, drawn with the save under way, as the timeline does: a moved event stays
 * where it was dropped until the api answers. Should the save fail, it goes back
 */
export const useCalendarEvents = (
  workOrders: WorkOrder[],
  services: Service[],
  workOrderMutations: Mutations<WorkOrder, FormWorkOrder>,
  serviceMutations: Mutations<Service, FormService>
) => {
  const pendingOrder = usePendingSave(workOrderMutations, [])

  const savingService = serviceMutations.status.pending.update as (FormService & Pick<Service, 'id'>) | null
  const pendingService = (service: Service) =>
    service.id === savingService?.id ? { ...service, ...savingService } as Service : service

  return calendarEvents(workOrders.map(pendingOrder), services.map(pendingService))
}
