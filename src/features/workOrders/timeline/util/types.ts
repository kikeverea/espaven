import type { WorkOrder } from '@/features/workOrders/types'
import type { Technician } from '@/features/users/types'
import type { TimeSpan } from '@/lib/time'

export type Zoom = 15 | 30 | 60

export type Conflict = 'order' | 'unavailable'

/* Why an order cannot go somewhere, and whose time it would clash with */
export type TeamConflict = { reason: Conflict, technician: Technician }

/* Whether a technician is free at an order's time (none, if it has no time), or what they have on then */
export type Availability =
  | { free: true, span: TimeSpan | null }
  | { free: false, title: string, span: TimeSpan }

export type ScheduleChange = Pick<WorkOrder, 'scheduledAt' | 'status'> & { technicians?: Technician[] }

export type Lane = {
  title: string
  empty: string
  badge: string
  track: string
  dropTrack: string
  card: string
  cardTitle: string
  sub: string
}

/* unassigned: orders with a time but no technician, of any day */
export type LaneType = 'unassigned' | 'unscheduled' | 'paused'

export type Drag = {
  order: WorkOrder
  from: 'row' | LaneType
  technician: Technician | null         // whose row it leaves. None from a lane
  grab: { x: number, y: number }
  size: { width: number, height: number }
  pointer: { x: number, y: number }
}

export type Ghost = {
  technicianId: Technician['id']        // the row it is over
  technicians: Technician[]             // the ones it would have, dropped there
  span: TimeSpan
  conflict: TeamConflict | null
  pinnedAt: string | null               // when it is booked, if it cannot move along the row
}

export type BlockStatus = 'done' | 'live' | 'todo'