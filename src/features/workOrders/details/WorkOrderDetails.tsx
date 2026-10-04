import { startOfDay } from 'date-fns'
import type { Technician } from '@/features/users/types'
import type { FormWorkOrder, WorkOrder } from '@/features/workOrders/types'
import type { Mutations } from '@/lib/mutations'
import { useScheduledWorkOrders, useWorkOrder } from '@/features/workOrders/useWorkOrders'
import { useTechnicians } from '@/features/users/useUsers'
import { useUnavailabilities } from '@/features/unavailabilities/useUnavailabilities'
import { usePendingSave } from '@/features/workOrders/pendingSave'
import { availability, dayPlan } from '@/features/workOrders/timeline/func/planner'
import { FONT } from '@/features/workOrders/timeline/util/styles'
import { cn } from '@/lib/utils'
import DetailsHeader from '@/features/workOrders/details/DetailsHeader'
import DetailsSchedule from '@/features/workOrders/details/DetailsSchedule'
import DetailsTechnicians from '@/features/workOrders/details/DetailsTechnicians'
import DetailsServices from '@/features/workOrders/details/DetailsServices'

type WorkOrderDetailsProps = {
  order: WorkOrder                                  // as it was when selected: shown until it loads
  mutations: Mutations<WorkOrder, FormWorkOrder>
  onClose: () => void
}

/* An order in the side tray: when it is on, who works on it and what is left to do. Changes save as they are made */
const WorkOrderDetails = ({ order: selected, mutations, onClose }: WorkOrderDetailsProps) => {
  const { data: technicians = [] } = useTechnicians()
  const pending = usePendingSave(mutations, technicians)
  const { data: loaded = selected } = useWorkOrder(selected)
  const order = pending(loaded)

  /* what the rest have on, the day of its time */
  const day = startOfDay(order.scheduledAt ? new Date(order.scheduledAt) : new Date())
  const { data: dayOrders } = useScheduledWorkOrders(day)
  const { data: unavailable } = useUnavailabilities(day)

  const scheduled = dayPlan((dayOrders?.collection ?? []).map(pending), day).scheduled
  const assigned = new Set(order.technicians?.map(({ id }) => id))

  const candidates = technicians
    .filter(({ id }) => !assigned.has(id))
    .map(technician => ({ technician, availability: availability(order, technician, scheduled, unavailable?.collection ?? []) }))

  const assign = (technicians: Technician[]) =>
    mutations.update({ id: order.id, technicianIds: technicians.map(({ id }) => id) } as FormWorkOrder & { id: WorkOrder['id'] })

  return (
    <div className={ cn(FONT, 'flex flex-col text-[#1C1917]') }>
      <DetailsHeader order={ order } onClose={ onClose } />
      <DetailsSchedule order={ order } />
      <DetailsTechnicians order={ order } candidates={ candidates } onChange={ assign } />
      <DetailsServices order={ order } />
    </div>
  )
}

export default WorkOrderDetails
