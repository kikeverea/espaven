import { createEvent, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setHours, setMinutes, startOfDay } from 'date-fns'
import { render } from '@/test/render.tsx'
import { camelize, snakeCase } from '@/lib/strings'
import { createFactories } from '@/test/factories'
import type { Technician } from '@/features/users/types'
import type { WorkOrder } from '@/features/workOrders/types'
import type { ScheduleUnavailability } from '@/features/unavailabilities/types'
import { useWorkOrderMutations } from '@/features/workOrders/useWorkOrders'
import WorkOrdersTimeline from '@/features/workOrders/timeline/WorkOrdersTimeline'

describe('WorkOrdersTimeline', () => {

  const { user, workOrder } = createFactories()

  const today = (hours: number) => setHours(startOfDay(new Date()), hours).toISOString()
  const technician = (fullName: string) => user({ fullName, roles: [ 'technician' ] }) as Technician

  const ana = technician('Ana García')
  const luis = technician('Luis Pérez')

  const vehicle = { ...workOrder().vehicle, plateNumber: '4821 KLM' }

  const orders = () => [
    workOrder({ number: 'OT-1', name: 'Frenos', technicians: [ ana ], scheduledAt: today(10), labourMinutes: 60, status: 'inProgress', vehicle }),
    workOrder({ number: 'OT-2', name: 'Aceite', technicians: [ luis ], scheduledAt: today(11), labourMinutes: 30, status: 'completed' }),
    workOrder({ number: 'OT-3', name: 'Embrague', technicians: [ luis ], scheduledAt: today(9), status: 'paused' }),
    workOrder({ number: 'OT-4', name: 'Escape', technicians: [], scheduledAt: null, labourMinutes: 60, status: 'notStarted' }),
  ]

  const unavailabilities = [ { id: 1, technician: luis, startsAt: today(14), endsAt: today(15), reason: 'Médico', createdAt: today(8) } ]

  type Api = {
    workOrders: WorkOrder[]
    technicians: Technician[]
    unavailabilities?: ScheduleUnavailability[]
    saves?: 'succeed' | 'fail' | 'hold'      // hold: the save waits until released
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

  /*
   * The api behind the timeline: it lists what it was given, and keeps what is saved, so the
   * refetch after a save brings it back. Returns the saves, as the api received them
   */
  const serve = ({ workOrders, technicians, unavailabilities = [], saves = 'succeed' }: Api) => {
    let stored = workOrders
    let release = () => {}
    const saved: [ WorkOrder['id'], Record<string, unknown> ][] = []

    const applied = (order: WorkOrder, body: Record<string, unknown>): WorkOrder => ({
      ...order,
      ...('status' in body && { status: camelize(body.status as string) as WorkOrder['status'] }),
      ...('scheduled_at' in body && { scheduledAt: body.scheduled_at as string | null }),
      ...('technician_ids' in body && {
        technicians: (body.technician_ids as Technician['id'][])
          .map(id => [ ...technicians, ...order.technicians ?? [] ].find(technician => technician.id === id)!),
      }),
    })

    const asRails = (order: WorkOrder) => ({ ...order, status: snakeCase(order.status) })

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const { pathname } = new URL(String(input))

      if (init?.method === 'PUT') {
        const id = Number(pathname.split('/').at(-1))
        const body = JSON.parse(String(init.body))
        saved.push([ id, body ])

        if (saves === 'fail')
          return json({ exception: 'Boom' }, 422)

        if (saves === 'hold')
          await new Promise<void>(resolve => { release = resolve })

        stored = stored.map(order => order.id === id ? applied(order, body) : order)
        return json(asRails(stored.find(order => order.id === id)!))
      }

      if (pathname.endsWith('/work_orders')) return json({ collection: stored.map(asRails) })
      if (pathname.endsWith('/users')) return json({ collection: technicians })
      if (pathname.endsWith('/schedule_unavailabilities')) return json({ collection: unavailabilities })

      return json({}, 404)
    })

    return { saved, release: () => release() }
  }

  type TimelineProps = { onSelect?: (order: WorkOrder) => void, selectedId?: WorkOrder['id'] }

  const Timeline = ({ onSelect, selectedId }: TimelineProps) =>
    <WorkOrdersTimeline mutations={ useWorkOrderMutations() } onSelect={ onSelect } selectedId={ selectedId } />

  /* renders it once the api has answered: every order and technician on screen */
  const renderTimeline = async (api: Api, onSelect?: (order: WorkOrder) => void) => {
    const server = serve(api)
    render(<Timeline onSelect={ onSelect } />)

    for (const { fullName } of api.technicians)
      await screen.findByRole('group', { name: `Agenda de ${fullName}` })

    for (const { name } of api.workOrders)
      await screen.findAllByText(name)

    for (const { reason } of api.unavailabilities ?? [])
      if (reason) await screen.findByText(reason)

    return server
  }

  afterEach(() => { vi.restoreAllMocks() })

  const row = (name: string) => screen.getByRole('group', { name: `Agenda de ${name}` })
  const tray = (name: string) => screen.getByRole('region', { name })
  const card = (title: string) => screen.getByText(title).closest('button') as HTMLElement

  /*
   * The pointer at a time, at 30 min (the default) where a minute is 2 px. The slot is centred
   * on the pointer: for these one-hour orders, the pointer at 12:30 places them at 12:00
   */
  const x = (hours: number, minutes = 0) => ((hours - 8) * 60 + minutes) * 2

  /* jsdom has no DragEvent: the pointer's position has to be set on the event by hand */
  const dragEvent = (type: 'dragStart' | 'dragOver' | 'drop', element: HTMLElement, clientX = 0) => {
    const event = createEvent[type](element)
    Object.defineProperty(event, 'clientX', { value: clientX })
    fireEvent(element, event)
  }

  const drag = (from: HTMLElement, to: HTMLElement, clientX = 0) => {
    dragEvent('dragStart', from)
    dragEvent('dragOver', to, clientX)
    dragEvent('drop', to, clientX)
    fireEvent.dragEnd(from)
  }

  test('puts the day’s orders on their technicians’ rows: title, then number and plate', async () => {
    await renderTimeline({ workOrders: orders(), technicians: [ ana, luis ] })

    expect(within(row('Ana García')).getByText('Frenos')).toBeInTheDocument()
    expect(within(row('Ana García')).getByText('OT-1 · 4821 KLM')).toBeInTheDocument()
    expect(within(row('Luis Pérez')).getByText('Aceite')).toBeInTheDocument()
  })

  test('keeps paused orders off the timeline, in their own tray', async () => {
    await renderTimeline({ workOrders: orders(), technicians: [ ana, luis ] })

    expect(within(row('Luis Pérez')).queryByText('Embrague')).not.toBeInTheDocument()
    expect(within(tray('En pausa')).getByText('Embrague')).toBeInTheDocument()
    expect(within(tray('Sin programar')).getByText('Escape')).toBeInTheDocument()
  })

  test('counts the day’s orders in the header', async () => {
    await renderTimeline({ workOrders: orders(), technicians: [ ana, luis ] })

    expect(screen.getByText('2 programadas')).toBeInTheDocument()
    expect(screen.getByText('1 en pausa')).toBeInTheDocument()
    expect(screen.getByText('1 sin programar')).toBeInTheDocument()
  })

  test('shows what each technician has booked of their hours, less the time they are out', async () => {
    await renderTimeline({ workOrders: orders(), technicians: [ ana, luis ], unavailabilities })

    expect(within(row('Ana García').parentElement!).getByText('1 h / 12 h')).toBeInTheDocument()
    expect(within(row('Luis Pérez').parentElement!).getByText('30 min / 11 h')).toBeInTheDocument()
    expect(within(row('Luis Pérez')).getByText('Médico')).toBeInTheDocument()
  })

  test('labels the hours closer as it zooms in', async () => {
    const user = userEvent.setup()
    await renderTimeline({ workOrders: orders(), technicians: [ ana ] })

    expect(screen.getByText('8:30')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: '1 h' }))
    expect(screen.queryByText('8:30')).not.toBeInTheDocument()
    expect(screen.getByText('9:00')).toBeInTheDocument()
  })

  test('moves between days', async () => {
    const user = userEvent.setup()
    await renderTimeline({ workOrders: orders(), technicians: [ ana ] })

    await user.click(screen.getByRole('button', { name: 'Día siguiente' }))
    expect(screen.queryByText('Frenos')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Hoy' }))
    expect(await screen.findByText('Frenos')).toBeInTheDocument()
  })

  test('selects the order of a block or a card', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const workOrders = orders()
    await renderTimeline({ workOrders, technicians: [ ana ] }, onSelect)

    await user.click(card('Frenos'))
    await user.click(card('Embrague'))

    expect(onSelect.mock.calls.map(([ order ]) => order.id)).toEqual([ workOrders[0].id, workOrders[2].id ])
  })

  describe('drag and drop', () => {

    test('schedules an order dragged from the tray onto a row, in 15 minute steps at any zoom', async () => {
      const workOrders = orders()
      const { saved } = await renderTimeline({ workOrders, technicians: [ ana, luis ] })

      /* at the default 30 min zoom, centred on 12:50 its edge is at 12:20, and lands on 12:15 */
      drag(card('Escape'), row('Ana García'), x(12, 50))

      expect(await within(row('Ana García')).findByText('Escape')).toBeInTheDocument()
      expect(saved).toEqual([ [ workOrders[3].id, {
        technician_ids: [ ana.id ],
        scheduled_at: setMinutes(setHours(startOfDay(new Date()), 12), 15).toISOString(),
        status: 'not_started',
      } ] ])
      expect(within(tray('Sin programar')).queryByText('Escape')).not.toBeInTheDocument()
      expect(screen.getByText('0 sin programar')).toBeInTheDocument()
    })

    test('shows a drop where it lands before the api answers', async () => {
      const { release } = await renderTimeline({ workOrders: orders(), technicians: [ ana ], saves: 'hold' })

      drag(card('Escape'), row('Ana García'), x(12, 30))

      expect(await within(row('Ana García')).findByText('Escape')).toBeInTheDocument()
      expect(within(tray('Sin programar')).queryByText('Escape')).not.toBeInTheDocument()

      release()
      expect(await within(row('Ana García')).findByText('Escape')).toBeInTheDocument()
    })

    test('centres the slot on the pointer, wherever the card was grabbed, and places the order by its left edge', async () => {
      const { saved } = await renderTimeline({ workOrders: orders(), technicians: [ ana ] })

      dragEvent('dragStart', card('Escape'), 40)
      dragEvent('dragOver', row('Ana García'), x(12, 30))
      expect(within(row('Ana García')).getByText('12:00 – 13:00')).toBeInTheDocument()

      dragEvent('drop', row('Ana García'), x(12, 30))
      await vi.waitFor(() =>
        expect(saved).toEqual([ [ expect.anything(), expect.objectContaining({ scheduled_at: today(12) }) ] ]))
    })

    test('names the order in the slot it previews', async () => {
      await renderTimeline({ workOrders: orders(), technicians: [ ana ] })

      dragEvent('dragStart', card('Escape'))
      dragEvent('dragOver', row('Ana García'), x(12))

      expect(within(row('Ana García')).getByText('Escape')).toHaveClass('truncate')
    })

    test('follows the pointer with the card, and with only a ring over the timeline', async () => {
      await renderTimeline({ workOrders: orders(), technicians: [ ana ] })
      const follower = () => document.querySelector('[data-drag-follower]')
      const escape = card('Escape')

      dragEvent('dragStart', escape)
      expect(follower()).toHaveAttribute('data-drag-follower', 'card')
      expect(follower()).toHaveTextContent('Escape')

      dragEvent('dragOver', row('Ana García'), x(12))
      expect(follower()).toHaveAttribute('data-drag-follower', 'ring')

      fireEvent.dragEnd(escape)
      expect(follower()).not.toBeInTheDocument()
    })

    test('previews where it lands, and refuses a drop over another order', async () => {
      const { saved } = await renderTimeline({ workOrders: orders(), technicians: [ ana ] })

      dragEvent('dragStart', card('Escape'))
      dragEvent('dragOver', row('Ana García'), x(12, 30))
      expect(within(row('Ana García')).getByText('12:00 – 13:00')).toBeInTheDocument()

      dragEvent('dragOver', row('Ana García'), x(10, 30))
      expect(within(row('Ana García')).getByText('Solapa con otra orden')).toBeInTheDocument()

      dragEvent('drop', row('Ana García'), x(10, 30))
      expect(saved).toEqual([])
      expect(within(tray('Sin programar')).getByText('Escape')).toBeInTheDocument()
    })

    test('refuses a drop over a stretch the technician is out', async () => {
      const { saved } = await renderTimeline({ workOrders: orders(), technicians: [ luis ], unavailabilities })

      dragEvent('dragStart', card('Escape'))
      dragEvent('dragOver', row('Luis Pérez'), x(14))
      expect(within(row('Luis Pérez')).getByText('No disponible')).toBeInTheDocument()

      dragEvent('drop', row('Luis Pérez'), x(14))
      expect(saved).toEqual([])
    })

    test('asks before taking an order off the timeline back to waiting', async () => {
      const user = userEvent.setup()
      const workOrders = orders()
      const { saved } = await renderTimeline({ workOrders, technicians: [ ana ] })

      drag(card('Frenos'), tray('Sin programar'))

      const dialog = screen.getByRole('alertdialog')
      expect(dialog).toHaveTextContent('OT-1 · Frenos ya está en curso')
      expect(saved).toEqual([])

      await user.click(within(dialog).getByRole('button', { name: 'Sacar de la programación' }))

      expect(await within(tray('Sin programar')).findByText('Frenos')).toBeInTheDocument()
      expect(saved).toEqual([ [ workOrders[0].id, { scheduled_at: null, status: 'not_started' } ] ])
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    test('leaves the order on the timeline when the user thinks better of it', async () => {
      const user = userEvent.setup()
      const { saved } = await renderTimeline({ workOrders: orders(), technicians: [ ana ] })

      drag(card('Frenos'), tray('Sin programar'))
      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(saved).toEqual([])
      expect(within(row('Ana García')).getByText('Frenos')).toBeInTheDocument()
    })

    test('pauses an order dropped on En pausa, from the timeline or from waiting, without asking', async () => {
      const workOrders = orders()
      const { saved } = await renderTimeline({ workOrders, technicians: [ ana ] })

      drag(card('Frenos'), tray('En pausa'))
      expect(await within(tray('En pausa')).findByText('Frenos')).toBeInTheDocument()

      drag(card('Escape'), tray('En pausa'))
      expect(await within(tray('En pausa')).findByText('Escape')).toBeInTheDocument()

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      expect(saved).toEqual([
        [ workOrders[0].id, { scheduled_at: null, status: 'paused' } ],
        [ workOrders[3].id, { scheduled_at: null, status: 'paused' } ],
      ])
      expect(within(row('Ana García')).queryByText('Frenos')).not.toBeInTheDocument()
    })

    test('picks a paused order up again: back to waiting, or onto a row, not started', async () => {
      const workOrders = orders()
      const { saved } = await renderTimeline({ workOrders, technicians: [ luis ] })

      drag(card('Embrague'), tray('Sin programar'))
      expect(await within(tray('Sin programar')).findByText('Embrague')).toBeInTheDocument()
      expect(saved.at(-1)).toEqual([ workOrders[2].id, { scheduled_at: null, status: 'not_started' } ])

      drag(card('Embrague'), row('Luis Pérez'), x(16))
      expect(await within(row('Luis Pérez')).findByText('Embrague')).toBeInTheDocument()
      expect(saved.at(-1)).toEqual([ workOrders[2].id, expect.objectContaining({ technician_ids: [ luis.id ], status: 'not_started' }) ])
    })

    test('does nothing when an order is dropped where it already is', async () => {
      const { saved } = await renderTimeline({ workOrders: orders(), technicians: [ ana ] })

      drag(card('Escape'), tray('Sin programar'))
      drag(card('Embrague'), tray('En pausa'))

      expect(saved).toEqual([])
    })

    test('takes a drop back when it cannot be saved', async () => {
      const { saved } = await renderTimeline({ workOrders: orders(), technicians: [ ana ], saves: 'fail' })

      drag(card('Escape'), row('Ana García'), x(12))

      await vi.waitFor(() => expect(saved).toHaveLength(1))
      expect(await within(tray('Sin programar')).findByText('Escape')).toBeInTheDocument()
      expect(within(row('Ana García')).queryByText('Escape')).not.toBeInTheDocument()
    })

    test('does not let completed orders be dragged', async () => {
      await renderTimeline({ workOrders: orders(), technicians: [ luis ] })

      expect(card('Aceite')).toHaveAttribute('draggable', 'false')
      expect(card('Embrague')).toHaveAttribute('draggable', 'true')
      expect(card('Escape')).toHaveAttribute('draggable', 'true')
    })
  })

  describe('v3 layout', () => {

    test('keeps the technician of an order dropped in a lane, and makes the row’s the lead on a row', async () => {
      const workOrders = orders()
      const { saved } = await renderTimeline({ workOrders, technicians: [ ana, luis ] })

      drag(card('Frenos'), tray('En pausa'))
      expect(await within(tray('En pausa')).findByText('Frenos')).toBeInTheDocument()
      expect(saved.at(-1)).toEqual([ workOrders[0].id, { scheduled_at: null, status: 'paused' } ])

      drag(card('Frenos'), row('Luis Pérez'), x(16, 30))
      expect(await within(row('Luis Pérez')).findByText('Frenos')).toBeInTheDocument()
      expect(within(row('Ana García')).getByText('Frenos')).toBeInTheDocument()
      expect(saved.at(-1)).toEqual([ workOrders[0].id, expect.objectContaining({ technician_ids: [ luis.id, ana.id ] }) ])
    })

    test('lists an order with a time but no technician as waiting', async () => {
      await renderTimeline({
        technicians: [ ana ],
        workOrders: [ workOrder({ name: 'Sin técnico', technicians: [], scheduledAt: today(10), status: 'pendingTechnician' }) ],
      })

      expect(within(tray('Sin programar')).getByText('Sin técnico')).toBeInTheDocument()
    })

    test('sizes the lanes’ cards by how long they take, at the zoom', async () => {
      const user = userEvent.setup()
      await renderTimeline({ workOrders: orders(), technicians: [ ana ] })

      /* 60 min at 2 px a minute, less the 4 px gap */
      expect(card('Escape')).toHaveStyle({ width: '116px' })

      await user.click(screen.getByRole('tab', { name: '15 min' }))
      expect(card('Escape')).toHaveStyle({ width: '176px' })
    })

    test('turns thin blocks’ text vertical, with the number short, and only the title at 15 minutes', async () => {
      await renderTimeline({
        technicians: [ ana ],
        workOrders: [
          workOrder({ number: 'OT-7', name: 'Media hora', technicians: [ ana ], scheduledAt: today(9), labourMinutes: 30, status: 'notStarted', vehicle }),
          workOrder({ number: 'OT-8', name: 'Cuarto', technicians: [ ana ], scheduledAt: today(12), labourMinutes: 15, status: 'notStarted', vehicle }),
          workOrder({ number: 'OT-9', name: 'Larga', technicians: [ ana ], scheduledAt: today(14), labourMinutes: 120, status: 'notStarted', vehicle }),
        ],
      })

      /* at 30 min, 30 minutes are 56 px: under 80 */
      expect(card('Media hora')).toHaveClass('[writing-mode:vertical-rl]')
      expect(within(card('Media hora')).getByText('7 · 4821 KLM')).toBeInTheDocument()

      expect(within(card('Cuarto')).queryByText(/8/)).not.toBeInTheDocument()

      expect(card('Larga')).not.toHaveClass('[writing-mode:vertical-rl]')
      expect(within(card('Larga')).getByText('OT-9 · 4821 KLM')).toBeInTheDocument()
    })

    test('says a waiting order has no time yet when hovered', async () => {
      const user = userEvent.setup()
      await renderTimeline({ workOrders: orders(), technicians: [ ana ] })

      await user.hover(card('Escape'))
      expect(screen.getByRole('tooltip')).toHaveTextContent('Sin hora · 1 h')
    })
  })

  describe('orders with several technicians', () => {

    const pedro = technician('Pedro Ruiz')

    const shared = () =>
      workOrder({ number: 'OT-5', name: 'Motor', technicians: [ ana, pedro ], scheduledAt: today(10), labourMinutes: 60, status: 'notStarted' })

    test('shows the order on each of its technicians’ rows', async () => {
      await renderTimeline({ workOrders: [ shared() ], technicians: [ ana, luis, pedro ] })

      expect(within(row('Ana García')).getByText('Motor')).toBeInTheDocument()
      expect(within(row('Pedro Ruiz')).getByText('Motor')).toBeInTheDocument()
      expect(within(row('Luis Pérez')).queryByText('Motor')).not.toBeInTheDocument()
    })

    test('swaps the technician whose row it leaves for the row’s, keeping the rest', async () => {
      const order = shared()
      const { saved } = await renderTimeline({ workOrders: [ order ], technicians: [ ana, luis, pedro ] })

      drag(within(row('Ana García')).getByText('Motor').closest('button')!, row('Luis Pérez'), x(12, 30))

      expect(await within(row('Luis Pérez')).findByText('Motor')).toBeInTheDocument()
      expect(saved).toEqual([ [ order.id, expect.objectContaining({ technician_ids: [ luis.id, pedro.id ], scheduled_at: today(12) }) ] ])
      expect(within(row('Pedro Ruiz')).getByText('Motor')).toBeInTheDocument()
      expect(within(row('Ana García')).queryByText('Motor')).not.toBeInTheDocument()
    })

    test('refuses a time taken on another of its technicians’ rows, naming who is busy', async () => {
      const pedrosOrder = workOrder({ name: 'Ruedas', technicians: [ pedro ], scheduledAt: today(12), labourMinutes: 60, status: 'notStarted' })
      const { saved } = await renderTimeline({ workOrders: [ shared(), pedrosOrder ], technicians: [ ana, pedro ] })

      dragEvent('dragStart', within(row('Ana García')).getByText('Motor').closest('button')!)
      dragEvent('dragOver', row('Ana García'), x(12, 30))
      expect(within(row('Ana García')).getByText('Pedro está ocupado')).toBeInTheDocument()

      dragEvent('dragOver', row('Pedro Ruiz'), x(12, 30))
      expect(within(row('Pedro Ruiz')).getByText('Solapa con otra orden')).toBeInTheDocument()

      dragEvent('drop', row('Pedro Ruiz'), x(12, 30))
      expect(saved).toEqual([])
    })

    test('keeps all its technicians when dropped in a lane, and shows them on its card', async () => {
      const user = userEvent.setup()
      const order = shared()
      const { saved } = await renderTimeline({ workOrders: [ order ], technicians: [ ana, pedro ] })

      drag(within(row('Ana García')).getByText('Motor').closest('button')!, tray('Sin programar'))
      await user.click(screen.getByRole('button', { name: 'Sacar de la programación' }))

      expect(await within(tray('Sin programar')).findByText('Motor')).toBeInTheDocument()
      expect(saved).toEqual([ [ order.id, { scheduled_at: null, status: 'not_started' } ] ])
      expect(within(row('Pedro Ruiz')).queryByText('Motor')).not.toBeInTheDocument()

      await vi.waitFor(() => expect(within(card('Motor')).getByText('AG')).toBeInTheDocument())
      expect(within(card('Motor')).getByText('PR')).toBeInTheDocument()
    })

    test('stacks the other technicians on each copy of the block', async () => {
      await renderTimeline({ workOrders: [ shared() ], technicians: [ ana, pedro ] })

      const anasCopy = within(row('Ana García')).getByText('Motor').closest('button')!
      const pedrosCopy = within(row('Pedro Ruiz')).getByText('Motor').closest('button')!

      expect(within(anasCopy).getByText('PR')).toBeInTheDocument()
      expect(within(anasCopy).queryByText('AG')).not.toBeInTheDocument()
      expect(within(pedrosCopy).getByText('AG')).toBeInTheDocument()

      /* 9px and 18 an avatar, for the title to end before it */
      expect(anasCopy).toHaveStyle({ paddingRight: '27px' })
    })

    test('names its technicians when hovered, and tells a click opens it', async () => {
      const user = userEvent.setup()
      await renderTimeline({ workOrders: [ shared() ], technicians: [ ana, pedro ] })

      await user.hover(within(row('Ana García')).getByText('Motor'))

      expect(screen.getByRole('tooltip')).toHaveTextContent('Ana García, Pedro Ruiz')
      expect(screen.getByRole('tooltip')).toHaveTextContent('Clic para ver detalles')
    })

    test('outlines every copy of the selected order', async () => {
      const order = shared()
      serve({ workOrders: [ order ], technicians: [ ana, pedro ] })
      render(<Timeline selectedId={ order.id } />)

      const copies = await screen.findAllByText('Motor')
      expect(copies).toHaveLength(2)
      copies.forEach(copy => expect(copy.closest('button')).toHaveClass('outline-[#1C1917]'))
    })
  })
})
