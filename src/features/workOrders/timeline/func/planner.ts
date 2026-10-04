import type { WorkOrder } from '@/features/workOrders/types'
import type { ScheduleUnavailability } from '@/features/unavailabilities/types'
import type { Technician } from '@/features/users/types'
import { END, overlaps, START } from '@/features/workOrders/timeline/func/timeline'
import { isSameDay } from 'date-fns'
import { minuteOfDay, spanOnDay, type TimeSpan } from '@/lib/time'
import type { Availability, BlockStatus, Conflict, TeamConflict } from '@/features/workOrders/timeline/util/types'


const BLOCK_STATUS: Partial<Record<WorkOrder['status'], BlockStatus>> = {
  completed: 'done',
  inProgress: 'live',
  notStarted: 'todo',
}

export const blockStatus = (order: WorkOrder): BlockStatus | null => BLOCK_STATUS[order.status] ?? null

export const spanOf = (order: WorkOrder): TimeSpan => {
  const start = minuteOfDay(new Date(order.scheduledAt!))
  return { start, end: start + order.labourMinutes }
}

const UNSCHEDULABLE: WorkOrder['status'][] = [ 'paused', 'completed', 'archived' ]

export const dayPlan = (workOrders: WorkOrder[], day: Date) => (
  {
    scheduled: workOrders.filter(order =>
      order.scheduledAt &&
      order.technicians?.length &&
      isSameDay(new Date(order.scheduledAt), day) &&
      blockStatus(order)
    ),
    unscheduled: workOrders.filter(order =>
      (!order.scheduledAt || !order.technicians?.length) &&
      !UNSCHEDULABLE.includes(order.status)
    ),
    paused: workOrders.filter(order => order.status === 'paused'),
  }
)


/* on every row of the technicians it has */
export const ordersOf = (technician: Technician, scheduled: WorkOrder[]) =>
  scheduled.filter(order => order.technicians?.some(({ id }) => id === technician.id))

export const technicianRows = (technicians: Technician[], scheduled: WorkOrder[]): Technician[] => {
  const byId = new Map(technicians.map(technician => [ technician.id, technician ]))

  scheduled.flatMap(order => order.technicians ?? []).forEach(technician => {
    if (!byId.has(technician.id))
      byId.set(technician.id, technician)
  })

  return [ ...byId.values() ].sort((a, b) => a.fullName.localeCompare(b.fullName))
}

export const unavailableSpans = (unavailabilities: ScheduleUnavailability[], technicianId: number, day: Date) =>
  unavailabilities
    .filter(unavailability => unavailability.technician?.id === technicianId)
    .map(unavailability => ({
      unavailability,
      span: spanOnDay(new Date(unavailability.startsAt), new Date(unavailability.endsAt), day),
    }))
    .filter((entry): entry is { unavailability: ScheduleUnavailability, span: TimeSpan } => entry.span != null)

export const conflictOf = (
  span: TimeSpan,
  moving: WorkOrder['id'],
  rowOrders: WorkOrder[],
  unavailable: TimeSpan[]
): Conflict | null => {
  if (rowOrders.some(order => order.id !== moving && overlaps(span, spanOf(order))))
    return 'order'

  if (unavailable.some(stretch => overlaps(span, stretch)))
    return 'unavailable'

  return null
}

/*
 * The technicians an order has once dropped on a row: the one whose row it leaves swapped for the
 * row's, in its place, the rest kept. From a lane, the row's leads them
 */
export const swapTechnician = (technicians: Technician[] = [], from: Technician | null, to: Technician): Technician[] => {
  const swapped = from ? technicians.map(technician => technician.id === from.id ? to : technician) : [ to, ...technicians ]
  return swapped.filter((technician, index) => swapped.findIndex(({ id }) => id === technician.id) === index)
}

/*
 * An order's time is all its technicians': the span has to be free on each of their rows. The
 * first of them taken, and why: list the row it is dropped on first, for its clash to be the one told
 */
export const teamConflictOf = (
  span: TimeSpan,
  moving: WorkOrder['id'],
  technicians: Technician[],
  scheduled: WorkOrder[],
  unavailabilities: ScheduleUnavailability[],
  day: Date
): TeamConflict | null => {
  for (const technician of technicians) {
    const reason = conflictOf(
      span,
      moving,
      ordersOf(technician, scheduled),
      unavailableSpans(unavailabilities, technician.id, day).map(({ span }) => span)
    )

    if (reason)
      return { reason, technician }
  }

  return null
}

/*
 * Whether a technician could join an order, at its time: free, or what they have on then. An order
 * without a time has nothing to clash with
 */
export const availability = (
  order: WorkOrder,
  technician: Technician,
  scheduled: WorkOrder[],
  unavailabilities: ScheduleUnavailability[]
): Availability => {
  if (!order.scheduledAt)
    return { free: true, span: null }

  const span = spanOf(order)
  const day = new Date(order.scheduledAt)

  const clash = ordersOf(technician, scheduled).find(other => other.id !== order.id && overlaps(span, spanOf(other)))
  if (clash)
    return { free: false, title: clash.name, span: spanOf(clash) }

  const out = unavailableSpans(unavailabilities, technician.id, day).find(({ span: stretch }) => overlaps(span, stretch))
  if (out)
    return { free: false, title: out.unavailability.reason || 'No disponible', span: out.span }

  return { free: true, span }
}

export const load = (rowOrders: WorkOrder[], unavailable: TimeSpan[]) => {
  const withinHours = ({ start, end }: TimeSpan) => Math.max(Math.min(end, END) - Math.max(start, START), 0)

  return {
    booked: rowOrders.reduce((minutes, order) => minutes + withinHours(spanOf(order)), 0),
    capacity: (END - START) - unavailable.reduce((minutes, stretch) => minutes + withinHours(stretch), 0),
  }
}
