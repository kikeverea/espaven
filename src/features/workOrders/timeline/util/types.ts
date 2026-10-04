import type { WorkOrder } from '@/features/workOrders/types'
import type { Technician } from '@/features/users/types'
import type { TimeSpan } from '@/lib/time'

export type Zoom = 15 | 30 | 60

export type Conflict = 'order' | 'unavailable'

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

export type LaneType = 'unscheduled' | 'paused'

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
  conflict: Conflict | null
}

export type BlockStatus = 'done' | 'live' | 'todo'