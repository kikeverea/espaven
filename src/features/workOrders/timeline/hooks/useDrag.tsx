import { useContext, type DragEvent } from 'react'
import type { Technician } from '@/features/users/types'
import type { WorkOrder } from '@/features/workOrders/types'
import { END, hideDragImage, laneChange, PX_PER_MIN, snapStart, START } from '@/features/workOrders/timeline/func/timeline'
import { spanOf, swapTechnician, teamConflictOf } from '@/features/workOrders/timeline/func/planner'
import { DragContext } from '@/features/workOrders/timeline/drag/DragContext'
import type { Drag, LaneType } from '@/features/workOrders/timeline/util/types'
import { atMinute } from '@/lib/time'

/*
 * The timeline's drag and drop: its state, and the handlers for what is dragged and where it is
 * dropped. The handlers read the event; the reducer keeps the state
 */
const useDrag = () => {
  const context = useContext(DragContext)

  if (!context)
    throw new Error('useDrag must be used within a DragProvider')

  const { state, dispatch, day, onDayChange, zoom, plan, unavailabilities, schedule } = context
  const { drag, ghost, unscheduling } = state

  /* technician: whose row it is taken from, if it is */
  const startDrag = (order: WorkOrder, from: Drag['from'], technician: Technician | null = null) => (event: DragEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()

    event.dataTransfer?.setData('text/plain', String(order.id))
    hideDragImage(event)       // the follower stands in for the browser's image of the card

    dispatch({
      type: 'started',
      drag: {
        order,
        from,
        technician,
        grab: { x: event.clientX - rect.left, y: event.clientY - rect.top },
        size: { width: rect.width, height: rect.height },
        pointer: { x: event.clientX, y: event.clientY },
      },
    })
  }

  const endDrag = () => dispatch({ type: 'ended' })

  const dragOverRow = (technician: Technician) => (event: DragEvent<HTMLElement>) => {
    if (!drag) return
    event.preventDefault()

    const track = event.currentTarget.getBoundingClientRect()
    const ppm = track.width ? track.width / (END - START) : PX_PER_MIN[zoom]      // the day may be stretched
    /* one booked already keeps its time: it only moves from row to row */
    const pinned = drag.from === 'unassigned'
    const pointer = event.clientX - track.left
    const left = pointer - drag.order.labourMinutes * ppm / 2
    const start = snapStart(left, drag.order.labourMinutes, ppm)
    const span = pinned ? spanOf(drag.order) : { start, end: start + drag.order.labourMinutes }

    const technicians = swapTechnician(drag.order.technicians, drag.technician, technician)
    const rowFirst = [ technician, ...technicians.filter(({ id }) => id !== technician.id) ]     // its clash is the one told
    const conflict = teamConflictOf(span, drag.order.id, rowFirst, plan.scheduled, unavailabilities, day)

    dispatch({
      type: 'placed',
      ghost: { technicianId: technician.id, technicians, span, conflict, pinnedAt: pinned ? drag.order.scheduledAt ?? null : null },
    })
  }

  const dropOnRow = (technician: Technician) => (event: DragEvent<HTMLElement>) => {
    event.preventDefault()

    if (drag && ghost && ghost.technicianId === technician.id && !ghost.conflict)
      schedule(drag.order, {
        technicians: ghost.technicians,
        scheduledAt: atMinute(day, ghost.span.start).toISOString(),
        /* a paused order picks up again; one waiting for a technician has one now */
        status: drag.from === 'paused' || drag.order.status === 'pendingTechnician' ? 'notStarted' : drag.order.status,
      })

    endDrag()
  }

  const dragOverLane = (lane: LaneType) => (event: DragEvent<HTMLElement>) => {
    if (!drag || !laneChange(lane, drag)) return
    event.preventDefault()
    dispatch({ type: 'overLane', lane })
  }

  const leaveLane = () => dispatch({ type: 'leftLane' })

  const dropOnLane = (lane: LaneType) => (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    const change = drag && laneChange(lane, drag)

    if (drag && change && drag.from === 'row' && lane === 'unscheduled')
      return dispatch({ type: 'unscheduleAsked', order: drag.order, change })

    if (drag && change)
      schedule(drag.order, change)

    endDrag()
  }

  const confirmUnschedule = () => {
    if (unscheduling) schedule(unscheduling.order, unscheduling.change)
    dispatch({ type: 'unscheduleClosed' })
  }

  const cancelUnschedule = () => dispatch({ type: 'unscheduleClosed' })

  return {
    ...state,
    day,
    onDayChange,
    startDrag,
    endDrag,
    dragOverRow,
    dropOnRow,
    dragOverLane,
    leaveLane,
    dropOnLane,
    confirmUnschedule,
    cancelUnschedule,
  }
}

export default useDrag
