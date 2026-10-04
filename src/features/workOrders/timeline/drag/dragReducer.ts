import type { WorkOrder } from '@/features/workOrders/types'
import type { Drag, Ghost, LaneType, ScheduleChange } from '@/features/workOrders/timeline/util/types'

export type DragState = {
  drag: Drag | null
  ghost: Ghost | null                   // where the order would go, on a technician's row
  overLane: LaneType | null             // the lane it would go to
  unscheduling: { order: WorkOrder, change: ScheduleChange } | null     // waiting for a confirmation
}

export type DragAction =
  | { type: 'started', drag: Drag }
  | { type: 'placed', ghost: Ghost }
  | { type: 'overLane', lane: LaneType }
  | { type: 'leftLane' }
  | { type: 'ended' }
  | { type: 'unscheduleAsked', order: WorkOrder, change: ScheduleChange }
  | { type: 'unscheduleClosed' }

export const initialDragState: DragState = { drag: null, ghost: null, overLane: null, unscheduling: null }

const ended = (state: DragState): DragState => ({ ...state, drag: null, ghost: null, overLane: null })

export const dragReducer = (state: DragState, action: DragAction): DragState => {
  switch (action.type) {
    case 'started':
      return { ...state, drag: action.drag, ghost: null, overLane: null }

    /* over a row or a lane only while dragging: one or the other */
    case 'placed':
      return state.drag ? { ...state, ghost: action.ghost, overLane: null } : state

    case 'overLane':
      return state.drag ? { ...state, ghost: null, overLane: action.lane } : state

    case 'leftLane':
      return { ...state, overLane: null }

    case 'ended':
      return ended(state)

    /* the drag ends, the order waits for the dialog */
    case 'unscheduleAsked':
      return { ...ended(state), unscheduling: { order: action.order, change: action.change } }

    case 'unscheduleClosed':
      return { ...state, unscheduling: null }
  }
}
