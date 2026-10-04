import type { FormWorkOrder, WorkOrder } from '@/features/workOrders/types'
import type { Technician } from '@/features/users/types'
import type { Mutations } from '@/lib/mutations'

/* An order's save as it goes to the api: its technicians by their ids */
export type WorkOrderSave = FormWorkOrder & { technicianIds?: Technician['id'][] }

/*
 * The order as the save under way leaves it, shown before the api answers. The ids it sends back to
 * technicians: from the list there is, or those the order already had
 */
export const withSave = (order: WorkOrder, saving: WorkOrderSave | null, technicians: Technician[]): WorkOrder => {
  if (order.id !== saving?.id)
    return order

  const technicianOf = (id: Technician['id']) =>
    technicians.find(technician => technician.id === id) ?? order.technicians?.find(technician => technician.id === id)

  return {
    ...order,
    ...saving,
    ...(saving.technicianIds && {
      technicians: saving.technicianIds.map(technicianOf).filter(technician => technician != null),
    }),
  } as WorkOrder
}

/* What the order being saved looks like until the api answers; any other, as it is */
export const usePendingSave = (mutations: Mutations<WorkOrder, FormWorkOrder>, technicians: Technician[]) => {
  const saving = mutations.status.pending.update as WorkOrderSave | null
  return (order: WorkOrder) => withSave(order, saving, technicians)
}
