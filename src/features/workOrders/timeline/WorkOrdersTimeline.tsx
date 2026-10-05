import { useState } from 'react'
import type { FormWorkOrder, WorkOrder } from '@/features/workOrders/types'
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
import { usePendingSave } from '@/features/workOrders/pendingSave'

type WorkOrdersTimelineProps = {
  selectedId?: WorkOrder['id'] | null       // open in the details: outlined wherever it shows
  onSelect?: (order: WorkOrder) => void
  mutations: Mutations<WorkOrder, FormWorkOrder>
}

const WorkOrdersTimeline = ({ selectedId, onSelect, mutations }: WorkOrdersTimelineProps) => {

  const [ day, setDay ] = useState(() => new Date())
  const [ zoom, setZoom ] = useState<Zoom>(30)

  const { data: scheduled } = useScheduledWorkOrders(day)
  const { data: technicians = [] } = useTechnicians()
  const { data: unavailableSlots } = useUnavailabilities(day)

  const { update } = mutations

  const unavailabilities = unavailableSlots?.collection ?? []

  const pending = usePendingSave(mutations, technicians)
  const orders = (scheduled?.collection ?? []).map(pending)

  const plan = dayPlan(orders, day)

  const schedule = (order: WorkOrder, { technicians, ...change }: ScheduleChange) =>
    update({ id: order.id, ...change, ...(technicians && { technicianIds: technicians.map(({ id }) => id) }) })

  return (
    <div className={ cn(FONT, 'text-[#1C1917]') }>
      <DragProvider day={ day } onDayChange={ setDay } zoom={ zoom } plan={ plan } unavailabilities={ unavailabilities } schedule={ schedule }>
        <TimelineGrid
          day={ day }
          zoom={ zoom }
          technicians={ technicians }
          plan={ plan }
          counts={{ scheduled: plan.scheduled.length, paused: plan.paused.length, unscheduled: plan.unscheduled.length }}
          unavailabilities={ unavailabilities }
          onDayChange={ setDay }
          onZoomChange={ setZoom }
          selectedId={ selectedId }
          onSelect={ onSelect }
        />

        <DragFollower />
        <UnscheduleDialog />
      </DragProvider>
    </div>
  )
}

export default WorkOrdersTimeline
