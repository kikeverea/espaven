import type { EventInput } from '@fullcalendar/react'
import type { Schedulable } from '@/features/schedulables/types'
import type { WorkOrder } from '@/features/workOrders/types'
import type { Service } from '@/features/services/types'
import { COMPLETED_STYLE, SCHEDULABLE_STYLES, type SchedulableKind } from '@/features/schedulables/styles'

/* What an event stands for, to find it again when it is moved or clicked */
export type EventSource = { kind: SchedulableKind, id: number }

/* Waiting to pick up again, as the timeline's paused lane */
const PAUSED = { backgroundColor: '#F6DDA6', borderColor: '#E9B85C', textColor: '#6B3F02' }

const span = ({ scheduledAt, labourMinutes }: Schedulable) => {
  const start = new Date(scheduledAt!)
  return { start, end: new Date(start.getTime() + labourMinutes * 60_000) }
}

const workOrderEvent = (order: WorkOrder): EventInput => {
  const done = order.status === 'completed'

  return {
    id: `workOrder-${order.id}`,
    title: `${order.number} · ${order.name}`,
    ...span(order),
    startEditable: !done,
    extendedProps: { kind: 'workOrder', id: order.id } satisfies EventSource,
    ...SCHEDULABLE_STYLES.workOrder!.event,
    ...(done && COMPLETED_STYLE.event),
    ...(order.status === 'paused' && PAUSED),
  }
}

const serviceEvent = (service: Service): EventInput => {
  const done = service.status === 'completed'

  return {
    id: `service-${service.id}`,
    title: service.name,
    ...span(service),
    startEditable: !done,
    extendedProps: { kind: 'service', id: service.id } satisfies EventSource,
    ...SCHEDULABLE_STYLES.service?.event,
    ...(done && COMPLETED_STYLE.event),
  }
}

/* What has a time, as the calendar's events. Archived orders and cancelled services are left out */
export const calendarEvents = (workOrders: WorkOrder[], services: Service[]): EventInput[] => [
  ...workOrders.filter(order => order.scheduledAt && order.status !== 'archived').map(workOrderEvent),
  ...services.filter(service => service.scheduledAt && service.status !== 'cancelled').map(serviceEvent),
]
