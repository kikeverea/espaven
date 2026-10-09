import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/render.tsx'
import { createFactories } from '@/test/factories'
import type { Service } from '@/features/services/types'
import type { WorkOrder } from '@/features/workOrders/types'
import { useWorkOrderMutations } from '@/features/workOrders/useWorkOrders'
import { useServiceMutations } from '@/features/services/useServices'
import { useCalendarEvents } from '@/features/calendar/useCalendarEvents'

describe('useCalendarEvents', () => {

  const { workOrder } = createFactories()

  const before = '2026-10-05T08:00:00.000Z'
  const after = '2026-10-06T11:30:00.000Z'

  const order = workOrder({ name: 'Frenos', scheduledAt: before, labourMinutes: 60 })
  const service = { id: 7, name: 'Aceite', status: 'not_started', scheduledAt: before, labourMinutes: 30 } as Service

  /* the saves wait until released, then succeed or fail */
  const serve = (outcome: 'succeed' | 'fail') => {
    let release = () => {}

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      if (init?.method === 'PUT') {
        await new Promise<void>(resolve => { release = resolve })
        return outcome === 'fail'
          ? new Response(JSON.stringify({ exception: 'Boom' }), { status: 422, headers: { 'Content-Type': 'application/json' } })
          : new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }

      return new Response(JSON.stringify({ collection: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    })

    return () => release()
  }

  afterEach(() => { vi.restoreAllMocks() })

  /* moves an event as a drop would, and lists where each one is drawn */
  const Calendar = ({ workOrders, services }: { workOrders: WorkOrder[], services: Service[] }) => {
    const workOrderMutations = useWorkOrderMutations()
    const serviceMutations = useServiceMutations()
    const events = useCalendarEvents(workOrders, services, workOrderMutations, serviceMutations)

    return (
      <>
        <button onClick={() => workOrderMutations.update({ id: order.id, scheduledAt: after })}>Mover orden</button>
        <button onClick={() => serviceMutations.update({ id: service.id, scheduledAt: after })}>Mover servicio</button>
        <ul>{ events.map(event => <li key={ event.id }>{ `${event.title} ${(event.start as Date).toISOString()}` }</li>) }</ul>
      </>
    )
  }

  test('keeps a moved work order where it was dropped while it saves', async () => {
    serve('succeed')
    render(<Calendar workOrders={[ order ]} services={[]} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Mover orden' }))
    expect(await screen.findByText(`${order.number} · Frenos ${after}`)).toBeInTheDocument()
  })

  test('keeps a moved service where it was dropped while it saves', async () => {
    serve('succeed')
    render(<Calendar workOrders={[]} services={[ service ]} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Mover servicio' }))
    expect(await screen.findByText(`Aceite ${after}`)).toBeInTheDocument()
  })

  test('puts it back when the save fails', async () => {
    const release = serve('fail')
    render(<Calendar workOrders={[ order ]} services={[]} />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Mover orden' }))
    expect(await screen.findByText(`${order.number} · Frenos ${after}`)).toBeInTheDocument()

    release()
    expect(await screen.findByText(`${order.number} · Frenos ${before}`)).toBeInTheDocument()
  })
})
