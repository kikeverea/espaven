import { describe, expect } from 'vitest'
import { createFactories } from '@/test/factories'
import { dragReducer, initialDragState, type DragState } from '@/features/workOrders/timeline/drag/dragReducer'
import type { Drag, Ghost, ScheduleChange } from '@/features/workOrders/timeline/util/types'

describe('dragReducer', () => {

  const { workOrder } = createFactories()

  const order = workOrder()
  const drag: Drag = { order, from: 'row', technician: null, grab: { x: 0, y: 0 }, size: { width: 100, height: 40 }, pointer: { x: 0, y: 0 } }
  const ghost: Ghost = { technicianId: 1, technicians: [], span: { start: 600, end: 660 }, conflict: null, pinnedAt: null }
  const change: ScheduleChange = { technicians: [], scheduledAt: null, status: 'notStarted' }

  const dragging: DragState = { ...initialDragState, drag }

  test('starts a drag afresh', () => {
    const state = dragReducer({ ...initialDragState, ghost, overLane: 'paused' }, { type: 'started', drag })
    expect(state).toEqual({ ...initialDragState, drag })
  })

  test('places the order on a row or over a lane, never both', () => {
    const overLane = dragReducer(dragging, { type: 'overLane', lane: 'unscheduled' })
    expect(overLane).toMatchObject({ ghost: null, overLane: 'unscheduled' })

    const placed = dragReducer(overLane, { type: 'placed', ghost })
    expect(placed).toMatchObject({ ghost, overLane: null })
  })

  test('places nothing without a drag', () => {
    expect(dragReducer(initialDragState, { type: 'placed', ghost })).toBe(initialDragState)
    expect(dragReducer(initialDragState, { type: 'overLane', lane: 'paused' })).toBe(initialDragState)
  })

  test('leaves a lane', () => {
    expect(dragReducer({ ...dragging, overLane: 'paused' }, { type: 'leftLane' }).overLane).toBeNull()
  })

  test('ends a drag, clearing where it was', () => {
    expect(dragReducer({ ...dragging, ghost }, { type: 'ended' })).toEqual(initialDragState)
  })

  test('ends the drag to ask before unscheduling, and closes the question', () => {
    const asked = dragReducer({ ...dragging, overLane: 'unscheduled' }, { type: 'unscheduleAsked', order, change })
    expect(asked).toEqual({ ...initialDragState, unscheduling: { order, change } })

    expect(dragReducer(asked, { type: 'unscheduleClosed' })).toEqual(initialDragState)
  })
})
