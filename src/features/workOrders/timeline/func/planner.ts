import type { WorkOrder } from '@/features/workOrders/types'
import type { ScheduleUnavailability } from '@/features/unavailabilities/types'
import type { Technician } from '@/features/users/types'
import { END, overlaps, START } from '@/features/workOrders/timeline/func/timeline'
import { isSameDay } from 'date-fns'
import { minuteOfDay, spanOnDay, type TimeSpan } from '@/lib/time'
import type { BlockStatus, Conflict } from '@/features/workOrders/timeline/util/types'


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
 * row's, the rest kept. From a lane, the row's joins them
 */
export const swapTechnician = (technicians: Technician[] = [], from: Technician | null, to: Technician): Technician[] => {
  const swapped = from ? technicians.map(technician => technician.id === from.id ? to : technician) : [ ...technicians, to ]
  return swapped.filter((technician, index) => swapped.findIndex(({ id }) => id === technician.id) === index)
}

/* An order's time is all its technicians': the span has to be free on each of their rows */
export const teamConflictOf = (
  span: TimeSpan,
  moving: WorkOrder['id'],
  technicians: Technician[],
  scheduled: WorkOrder[],
  unavailabilities: ScheduleUnavailability[],
  day: Date
): Conflict | null =>
  technicians
    .map(technician => conflictOf(
      span,
      moving,
      ordersOf(technician, scheduled),
      unavailableSpans(unavailabilities, technician.id, day).map(({ span }) => span)
    ))
    .find(conflict => conflict != null) ?? null

export const load = (rowOrders: WorkOrder[], unavailable: TimeSpan[]) => {
  const withinHours = ({ start, end }: TimeSpan) => Math.max(Math.min(end, END) - Math.max(start, START), 0)

  return {
    booked: rowOrders.reduce((minutes, order) => minutes + withinHours(spanOf(order)), 0),
    capacity: (END - START) - unavailable.reduce((minutes, stretch) => minutes + withinHours(stretch), 0),
  }
}
