import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setHours, startOfDay } from 'date-fns'
import { render } from '@/test/render.tsx'
import { createFactories } from '@/test/factories'
import type { Technician } from '@/features/users/types'
import type { WorkOrder } from '@/features/workOrders/types'
import { useWorkOrderMutations } from '@/features/workOrders/useWorkOrders'
import WorkOrderDetails from '@/features/workOrders/details/WorkOrderDetails'

describe('WorkOrderDetails', () => {

  const { user, workOrder } = createFactories()

  const today = (hours: number) => setHours(startOfDay(new Date()), hours).toISOString()
  const technician = (fullName: string) => user({ fullName, roles: [ 'technician' ] }) as Technician

  const ana = technician('Ana García')
  const luis = technician('Luis Pérez')
  const pedro = technician('Pedro Ruiz')

  const vehicle = { ...workOrder().vehicle, plateNumber: '4821 KLM', make: 'Seat', model: 'Ibiza' }

  const motor = (args: Partial<WorkOrder> = {}) =>
    workOrder({ number: 'OT-5', name: 'Motor', technicians: [ ana ], scheduledAt: today(10), labourMinutes: 90, status: 'inProgress', vehicle, ...args })

  const services = [
    { id: 1, name: 'Cambio de aceite', status: 'completed', expected_minutes: 30 },
    { id: 2, name: 'Filtro de aire', status: 'not_started', expected_minutes: 60 },
    { id: 3, name: 'Anulado', status: 'cancelled', expected_minutes: 15 },
  ]

  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })

  /*
   * The api behind the details: the order, the day's others, technicians and services. It keeps what
   * is saved, so the refetch after a save brings it back. Returns the saves
   */
  const serve = (order: WorkOrder, others: WorkOrder[] = []) => {
    const saved: [ string, Record<string, unknown> ][] = []
    let stored = { ...order, status: 'in_progress' }
    let storedServices = services

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const { pathname } = new URL(String(input))

      if (init?.method === 'PUT') {
        const body = JSON.parse(String(init.body))
        saved.push([ pathname, body ])

        if (pathname.includes('/services/')) {
          const id = Number(pathname.split('/').at(-1))
          storedServices = storedServices.map(service => service.id === id ? { ...service, ...body } : service)
          return json(storedServices.find(service => service.id === id))
        }

        if (body.technician_ids)
          stored = { ...stored, technicians: body.technician_ids.map((id: number) => [ ana, luis, pedro ].find(technician => technician.id === id)) }
        return json(stored)
      }

      if (pathname.endsWith(`/work_orders/${order.id}`)) return json(stored)
      if (pathname.endsWith('/work_orders')) return json({ collection: [ stored, ...others.map(other => ({ ...other, status: 'not_started' })) ] })
      if (pathname.endsWith('/users')) return json({ collection: [ ana, luis, pedro ] })
      if (pathname.endsWith('/schedule_unavailabilities')) return json({ collection: [] })
      if (pathname.endsWith('/services')) return json({ collection: storedServices })

      return json({})
    })

    return saved
  }

  afterEach(() => { vi.restoreAllMocks() })

  const Details = ({ order, onClose = () => {} }: { order: WorkOrder, onClose?: () => void }) =>
    <WorkOrderDetails order={ order } mutations={ useWorkOrderMutations() } onClose={ onClose } />

  const technicians = () => screen.getByRole('region', { name: 'Técnicos' })
  const servicesSection = () => screen.getByRole('region', { name: 'Servicios' })

  test('heads with the number, status, title and vehicle, then when it is on and how long', async () => {
    serve(motor())
    render(<Details order={ motor() } />)

    expect(screen.getByText('OT-5')).toBeInTheDocument()
    expect(screen.getByText('En curso')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Motor' })).toBeInTheDocument()
    expect(screen.getByText('4821 KLM · Seat Ibiza')).toBeInTheDocument()
    expect(screen.getByText('10:00 – 11:30')).toBeInTheDocument()
    expect(screen.getByText('1 h 30 min')).toBeInTheDocument()
  })

  test('closes from its button', async () => {
    const onClose = vi.fn()
    serve(motor())
    render(<Details order={ motor() } onClose={ onClose } />)

    await userEvent.setup().click(screen.getByRole('button', { name: 'Cerrar detalles' }))
    expect(onClose).toHaveBeenCalled()
  })

  test('picks from the technicians it does not have, telling who is free at its time', async () => {
    const user = userEvent.setup()
    const order = motor()
    const saved = serve(order, [ workOrder({ name: 'Ruedas', technicians: [ pedro ], scheduledAt: today(11), labourMinutes: 60 }) ])
    render(<Details order={ order } />)

    await user.click(within(technicians()).getByRole('button', { name: '+ Añadir técnico' }))

    const luisRow = await screen.findByRole('button', { name: /Luis Pérez/ })
    expect(luisRow).toHaveTextContent('Libre 10:00 – 11:30')
    expect(luisRow).toBeEnabled()

    const pedroRow = await screen.findByRole('button', { name: /Ocupado · Ruedas 11:00–12:00/ })
    expect(pedroRow).toBeDisabled()
    expect(screen.queryByRole('button', { name: /Ana García/ })).not.toBeInTheDocument()

    await user.click(luisRow)

    expect(await within(technicians()).findByText('Luis Pérez')).toBeInTheDocument()
    expect(within(technicians()).getByText('Apoyo')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Libre/ })).not.toBeInTheDocument()
    await vi.waitFor(() => expect(saved).toEqual([ [ `/api/work_orders/${order.id}`, expect.objectContaining({ technician_ids: [ ana.id, luis.id ] }) ] ]))
  })

  test('says an order without a time has nothing to clash with', async () => {
    const user = userEvent.setup()
    const order = motor({ scheduledAt: null })
    serve(order)
    render(<Details order={ order } />)

    await user.click(within(technicians()).getByRole('button', { name: '+ Añadir técnico' }))
    expect(await screen.findByRole('button', { name: /Luis Pérez.*Orden sin hora asignada/ })).toBeEnabled()
  })

  test('makes a technician the lead, and takes one off', async () => {
    const user = userEvent.setup()
    const order = motor({ technicians: [ ana, luis ] })
    const saved = serve(order)
    render(<Details order={ order } />)

    await user.click(within(technicians()).getByRole('button', { name: 'Hacer responsable' }))
    await vi.waitFor(() => expect(saved.at(-1)?.[1]).toMatchObject({ technician_ids: [ luis.id, ana.id ] }))

    await user.click(within(technicians()).getByRole('button', { name: 'Quitar a Ana García' }))
    await vi.waitFor(() => expect(saved.at(-1)?.[1]).toMatchObject({ technician_ids: [ luis.id ] }))
  })

  test('keeps the last technician of a scheduled order, but not of one waiting', async () => {
    serve(motor())
    const { unmount } = render(<Details order={ motor() } />)

    expect(within(technicians()).getByText('Responsable')).toBeInTheDocument()
    expect(within(technicians()).queryByRole('button', { name: /Quitar/ })).not.toBeInTheDocument()
    unmount()

    const waiting = motor({ scheduledAt: null })
    serve(waiting)
    render(<Details order={ waiting } />)
    expect(within(technicians()).getByRole('button', { name: 'Quitar a Ana García' })).toBeInTheDocument()
  })

  test('ticks its services off, leaving the cancelled out', async () => {
    const user = userEvent.setup()
    const saved = serve(motor())
    render(<Details order={ motor() } />)

    expect(await within(servicesSection()).findByText('1 de 2 hechos')).toBeInTheDocument()
    expect(within(servicesSection()).queryByText('Anulado')).not.toBeInTheDocument()
    expect(within(servicesSection()).getByText('1 h 30 min')).toBeInTheDocument()

    await user.click(within(servicesSection()).getByRole('checkbox', { name: /Filtro de aire/ }))

    expect(await within(servicesSection()).findByText('2 de 2 hechos')).toBeInTheDocument()
    expect(saved).toEqual([ [ '/api/services/2', expect.objectContaining({ status: 'completed' }) ] ])
  })
})
