import { setHours, startOfDay } from 'date-fns'
import { createFactories } from '@/test/factories.ts'
import type { Technician } from '@/features/users/types.ts'
import { conflictOf, load, dayPlan, ordersOf, swapTechnician, teamConflictOf, technicianRows, unavailableSpans } from '@/features/workOrders/timeline/func/planner.ts'

describe('planner', () => {

  const { user, workOrder } = createFactories()

  const day = new Date(2026, 9, 2)
  const at = (hours: number, date = day) => setHours(startOfDay(date), hours).toISOString()
  const ana = user({ fullName: 'Ana', roles: [ 'technician' ] }) as Technician
  const luis = user({ fullName: 'Luis', roles: [ 'technician' ] }) as Technician
  const pedro = user({ fullName: 'Pedro', roles: [ 'technician' ] }) as Technician

  test('puts each order where it belongs on the day', () => {
    const today = workOrder({ status: 'notStarted', technicians: [ ana ], scheduledAt: at(9) })
    const live = workOrder({ status: 'inProgress', technicians: [ ana ], scheduledAt: at(10) })
    const tomorrow = workOrder({ status: 'notStarted', technicians: [ ana ], scheduledAt: at(9, new Date(2026, 9, 3)) })
    const waiting = workOrder({ status: 'notStarted', scheduledAt: null })
    const noTechnician = workOrder({ status: 'pendingTechnician', scheduledAt: null })
    const pausedScheduled = workOrder({ status: 'paused', technicians: [ ana ], scheduledAt: at(11) })
    const pausedWaiting = workOrder({ status: 'paused', scheduledAt: null })
    const archived = workOrder({ status: 'archived', scheduledAt: null })

    const timedWithoutTechnicians = workOrder({ status: 'notStarted', technicians: [], scheduledAt: at(12) })

    const plan = dayPlan([ today, live, tomorrow, waiting, noTechnician, pausedScheduled, pausedWaiting, archived, timedWithoutTechnicians ], day)

    expect(plan.scheduled).toEqual([ today, live ])
    expect(plan.unscheduled).toEqual([ waiting, noTechnician, timedWithoutTechnicians ])
    expect(plan.paused).toEqual([ pausedScheduled, pausedWaiting ])
  })

  test('blocks a span over another order of the row, or over a stretch the technician is out', () => {
    const order = workOrder({ technicians: [ ana ], scheduledAt: at(9), labourMinutes: 60 })

    expect(conflictOf({ start: 570, end: 630 }, 0, [ order ], [])).toBe('order')
    expect(conflictOf({ start: 600, end: 660 }, 0, [ order ], [])).toBeNull()
    expect(conflictOf({ start: 570, end: 630 }, order.id, [ order ], [])).toBeNull()
    expect(conflictOf({ start: 840, end: 900 }, 0, [ order ], [{ start: 870, end: 930 }])).toBe('unavailable')
  })

  test('finds the stretches a technician is out on the day', () => {
    const unavailabilities = [
      { id: 1, technician: ana, startsAt: at(14), endsAt: at(15), createdAt: at(8) },
      { id: 2, technician: luis, startsAt: at(9), endsAt: at(10), createdAt: at(8) },
    ]

    expect(unavailableSpans(unavailabilities, ana.id, day).map(({ span }) => span)).toEqual([ { start: 840, end: 900 } ])
  })

  test('weighs what a technician has booked against the hours they are in', () => {
    const orders = [
      workOrder({ technicians: [ ana ], scheduledAt: at(9), labourMinutes: 90 }),
      workOrder({ technicians: [ ana ], scheduledAt: at(19), labourMinutes: 120 }),   // only one hour before closing
    ]

    expect(load(orders, [ { start: 840, end: 900 } ])).toEqual({ booked: 150, capacity: 660 })
  })

  describe('orders with several technicians', () => {

    const shared = workOrder({ status: 'notStarted', technicians: [ ana, pedro ], scheduledAt: at(10), labourMinutes: 60 })

    test('puts the order on each of its technicians’ rows', () => {
      expect(ordersOf(ana, [ shared ])).toEqual([ shared ])
      expect(ordersOf(pedro, [ shared ])).toEqual([ shared ])
      expect(ordersOf(luis, [ shared ])).toEqual([])
    })

    test('gives a row to every technician with an order, once', () => {
      expect(technicianRows([ ana ], [ shared ])).toEqual([ ana, pedro ])
    })

    test('swaps the technician whose row the order leaves for the row’s, keeping the rest', () => {
      expect(swapTechnician([ ana, pedro ], ana, luis)).toEqual([ luis, pedro ])
      expect(swapTechnician([ ana, pedro ], ana, ana)).toEqual([ ana, pedro ])
      expect(swapTechnician([ ana, pedro ], ana, pedro)).toEqual([ pedro ])
    })

    test('adds the row’s technician to an order coming from a lane', () => {
      expect(swapTechnician([], null, luis)).toEqual([ luis ])
      expect(swapTechnician([ pedro ], null, luis)).toEqual([ pedro, luis ])
      expect(swapTechnician([ luis ], null, luis)).toEqual([ luis ])
    })

    test('blocks a span taken on any of the technicians’ rows, not only the one it is dropped on', () => {
      const pedrosOrder = workOrder({ status: 'notStarted', technicians: [ pedro ], scheduledAt: at(12), labourMinutes: 60 })
      const unavailabilities = [ { id: 1, technician: pedro, startsAt: at(14), endsAt: at(15), createdAt: at(8) } ]
      const scheduled = [ shared, pedrosOrder ]

      expect(teamConflictOf({ start: 720, end: 780 }, shared.id, [ ana, pedro ], scheduled, [], day)).toBe('order')
      expect(teamConflictOf({ start: 720, end: 780 }, shared.id, [ ana ], scheduled, [], day)).toBeNull()
      expect(teamConflictOf({ start: 840, end: 900 }, shared.id, [ ana, pedro ], scheduled, unavailabilities, day)).toBe('unavailable')
      expect(teamConflictOf({ start: 600, end: 660 }, shared.id, [ ana, pedro ], scheduled, unavailabilities, day)).toBeNull()
    })
  })
})
