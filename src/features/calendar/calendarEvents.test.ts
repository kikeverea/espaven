import { createFactories } from '@/test/factories'
import type { Service } from '@/features/services/types'
import { calendarEvents } from '@/features/calendar/calendarEvents'

describe('calendarEvents', () => {

  const { workOrder } = createFactories()

  const at = '2026-10-05T08:30:00.000Z'
  const service = (args: Partial<Service> = {}) =>
    ({ id: 1, name: 'Cambio de aceite', status: 'not_started', scheduledAt: at, labourMinutes: 30, ...args }) as Service

  test('places what has a time, as long as it takes', () => {
    const order = workOrder({ number: 'OT-1', name: 'Frenos', scheduledAt: at, labourMinutes: 90 })

    expect(calendarEvents([ order ], [ service() ])).toEqual([
      expect.objectContaining({
        id: `workOrder-${order.id}`,
        title: 'OT-1 · Frenos',
        start: new Date(at),
        end: new Date('2026-10-05T10:00:00.000Z'),
        startEditable: true,
        extendedProps: { kind: 'workOrder', id: order.id },
      }),
      expect.objectContaining({
        id: 'service-1',
        title: 'Cambio de aceite',
        end: new Date('2026-10-05T09:00:00.000Z'),
        extendedProps: { kind: 'service', id: 1 },
      }),
    ])
  })

  test('leaves out what has no time, archived orders and cancelled services', () => {
    const events = calendarEvents(
      [ workOrder({ scheduledAt: null }), workOrder({ scheduledAt: at, status: 'archived' }) ],
      [ service({ scheduledAt: null }), service({ status: 'cancelled' }) ]
    )

    expect(events).toEqual([])
  })

  test('keeps what is done where it is, in green', () => {
    const [ order, done ] = calendarEvents(
      [ workOrder({ scheduledAt: at, status: 'completed' }) ],
      [ service({ status: 'completed' }) ]
    )

    expect(order).toMatchObject({ startEditable: false, backgroundColor: '#E8F3EC' })
    expect(done).toMatchObject({ startEditable: false, backgroundColor: '#E8F3EC' })
  })
})
