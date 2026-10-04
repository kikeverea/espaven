import { useState } from 'react'
import type { FormWorkOrder, WorkOrder } from '@/features/workOrders/types'
import type { Technician } from '@/features/users/types'
import { dayPlan } from '@/features/workOrders/timeline/func/planner'
import TimelineGrid from '@/features/workOrders/timeline/grid/TimelineGrid'
import UnscheduleDialog from '@/features/workOrders/timeline/UnscheduleDialog'
import DragFollower from '@/features/workOrders/timeline/DragFollower'
import { DragProvider } from '@/features/workOrders/timeline/drag/DragContext'
import { FONT } from '@/features/workOrders/timeline/util/styles'
import { cn } from '@/lib/utils'
import type { ScheduleChange, Zoom } from '@/features/workOrders/timeline/util/types'
import { useScheduledWorkOrders } from '@/features/workOrders/useWorkOrders'
import { useTechnicians } from '@/features/users/useUsers'
import { useUnavailabilities } from '@/features/unavailabilities/useUnavailabilities'
import type { Mutations } from '@/lib/mutations'

type WorkOrdersTimelineProps = {
  onSelect?: (id: WorkOrder['id']) => void
  mutations: Mutations<WorkOrder, FormWorkOrder>
}

const WorkOrdersTimeline = ({ onSelect, mutations }: WorkOrdersTimelineProps) => {

  const [ day, setDay ] = useState(() => new Date())
  const [ zoom, setZoom ] = useState<Zoom>(30)

  const { data: scheduled } = useScheduledWorkOrders(day)
  const { data: technicians = [] } = useTechnicians()
  const { data: unavailableSlots } = useUnavailabilities(day)

  const { update, status } = mutations

  const unavailabilities = unavailableSlots?.collection ?? []

  /* the save under way, shown before the api answers. It sends technicianIds: back to technicians */
  const saving = status.pending.update as (FormWorkOrder & { technicianIds?: Technician['id'][] }) | null
  const technicianOf = (order: WorkOrder) => (id: Technician['id']) =>
    technicians.find(technician => technician.id === id) ?? order.technicians?.find(technician => technician.id === id)

  const orders = (scheduled?.collection ?? []).map(order =>
    order.id === saving?.id
      ? {
          ...order,
          ...saving,
          ...(saving.technicianIds && {
            technicians: saving.technicianIds.map(technicianOf(order)).filter(technician => technician != null),
          }),
        }
      : order
  )

  const plan = dayPlan(orders, day)

  const schedule = (order: WorkOrder, { technicians, ...change }: ScheduleChange) =>
    update({ id: order.id, ...change, ...(technicians && { technicianIds: technicians.map(({ id }) => id) }) })

  return (
    <div className={ cn(FONT, 'text-[#1C1917]') }>
      <DragProvider day={ day } zoom={ zoom } plan={ plan } unavailabilities={ unavailabilities } schedule={ schedule }>
        <TimelineGrid
          day={ day }
          zoom={ zoom }
          technicians={ technicians }
          plan={ plan }
          counts={{ scheduled: plan.scheduled.length, paused: plan.paused.length, unscheduled: plan.unscheduled.length }}
          unavailabilities={ unavailabilities }
          onDayChange={ setDay }
          onZoomChange={ setZoom }
          onSelect={ onSelect }
        />

        <DragFollower />
        <UnscheduleDialog />
      </DragProvider>
    </div>
  )
}

export default WorkOrdersTimeline
