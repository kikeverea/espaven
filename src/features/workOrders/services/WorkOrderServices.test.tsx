import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { startOfYesterday } from 'date-fns'
import { render } from '@/test/render.tsx'
import { createFactories } from '@/test/factories'
import WorkOrderServices from '@/features/workOrders/services/WorkOrderServices'

describe('WorkOrderServices', () => {

  const { workOrder, serviceTemplate, inventoryItem, inventoryCategory, vehicle, contact } = createFactories()

  const brakes = inventoryCategory({ name: 'Frenos' })
  const tyres = inventoryCategory({ name: 'Neumáticos' })

  const pads = inventoryItem({ name: 'Pastillas delanteras', inventoryCategory: brakes })
  const fluid = inventoryItem({ name: 'Líquido de frenos', inventoryCategory: brakes, stock: 0 })

  const front = serviceTemplate({ name: 'Cambio de pastillas', labourMinutes: 60, inventoryCategory: brakes, items: [ { inventoryItem: pads, quantity: 2 } ] })
  const rear = serviceTemplate({ name: 'Pastillas traseras', labourMinutes: 45 })
  const bleed = serviceTemplate({ name: 'Purgado de frenos', labourMinutes: 30, items: [ { inventoryItem: fluid } ] })
  const complete = serviceTemplate({ name: 'Frenos completos', labourMinutes: 75, inventoryCategory: brakes, children: [ rear, bleed ] })
  const alignment = serviceTemplate({ name: 'Alineación', labourMinutes: 45, inventoryCategory: tyres })

  const laura = contact({ name: 'Laura', lastName: 'Martín Soler', phoneNumbers: [ { number: '612 345 678', primary: true } ] })
  const andres = contact({ name: 'Andrés', lastName: 'Pons' })
  const corolla = vehicle({ plateNumber: '4521 KLM', make: 'Toyota', model: 'Corolla 1.8 Hybrid', year: 2019, fuel: 'Híbrido', kilometres: 58900, client: laura })
  const ibiza = vehicle({ plateNumber: '2290 LBM', make: 'Seat', model: 'Ibiza 1.0 TSI', year: 2020, kilometres: 54200, client: andres })
  const golf = vehicle({ plateNumber: '1184 HGT', make: 'Volkswagen', model: 'Golf 2.0 TDI', year: 2013, client: andres })

  const order = workOrder({ number: 'OT-7', name: 'Revisión', vehicle: corolla, entryKilometres: null })
  const oil = { id: 41, name: 'Cambio de aceite', status: 'not_started', labour_minutes: 30, work_order_id: order.id }

  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })

  /* What the page reads from the api, by the last serve */
  let read: URL[] = []

  /* The api behind the page. Returns what is written, with where to */
  const serve = () => {
    const written: [ string, string, unknown ][] = []
    read = []

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = new URL(String(input))
      const { pathname, searchParams } = url

      if (init?.method === 'POST' || init?.method === 'PUT') {
        const body = JSON.parse(String(init.body))
        written.push([ init.method, pathname.replace(/^\/api/, ''), body ])
        return pathname.endsWith('/vehicles')
          ? json({ ...body, id: 99, client: [ laura, andres ].find(({ id }) => id === body.client_id) })
          : json(order)
      }

      read.push(url)
      if (pathname.endsWith('/vehicles')) return json({ collection: searchParams.get('search') === 'golf' ? [ golf ] : [ corolla, ibiza ] })
      if (pathname.endsWith('/clients')) return json({ collection: searchParams.get('search') ? [ andres ] : [] })

      if (pathname.endsWith(`/work_orders/${order.id}`)) return json(order)
      if (pathname.endsWith('/service_templates') && searchParams.get('roots') === 'true') return json({ collection: [ front, complete, alignment ] })
      if (pathname.endsWith('/inventory_categories')) return json({ collection: [ brakes, tyres ] })
      if (pathname.endsWith('/inventory_items')) return json({ collection: [ pads, fluid ] })
      if (pathname.endsWith('/services')) return json({ collection: [ oil ] })

      return json({ collection: [] })
    })

    return written
  }

  afterEach(() => { vi.restoreAllMocks() })

  const list = () => screen.getByRole('complementary', { name: 'Servicios de la orden' })
  const saveButton = (name = 'Guardar cambios') => within(list()).getByRole('button', { name })

  test('shows the catalogue by category, with how many services each has', async () => {
    serve()
    render(<WorkOrderServices id={ order.id } />)

    expect(await screen.findByRole('button', { name: /Frenos\s*2 servicios/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Neumáticos\s*1 servicio$/ })).toBeInTheDocument()
  })

  test('picks services from a category, a group all at once or child by child', async () => {
    const user = userEvent.setup()
    serve()
    render(<WorkOrderServices id={ order.id } />)

    await user.click(await screen.findByRole('button', { name: /Frenos\s*2 servicios/ }))
    await user.click(screen.getByRole('checkbox', { name: 'Cambio de pastillas' }))

    expect(within(list()).getByText('Cambio de pastillas')).toBeInTheDocument()
    expect(within(list()).getByText('1 h · 1 artículo')).toBeInTheDocument()

    const group = screen.getByRole('checkbox', { name: 'Frenos completos' })
    await user.click(group)
    expect(group).toHaveAttribute('aria-checked', 'true')
    expect(within(list()).getByText('Pastillas traseras')).toBeInTheDocument()
    expect(within(list()).getByText('Purgado de frenos')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Abrir Frenos completos' }))
    await user.click(within(screen.getByRole('list', { name: 'Frenos completos' })).getByRole('checkbox', { name: 'Purgado de frenos' }))

    expect(group).toHaveAttribute('aria-checked', 'mixed')
    expect(within(list()).queryByText('Purgado de frenos')).not.toBeInTheDocument()
    expect(within(list()).getByText('2,25 h')).toBeInTheDocument()     // 30 it had, 60 + 45 picked
  })

  test('finds services in every category, a group\'s children among them', async () => {
    const user = userEvent.setup()
    serve()
    render(<WorkOrderServices id={ order.id } />)

    await screen.findByRole('button', { name: /Frenos\s*2 servicios/ })
    await user.type(screen.getByRole('searchbox', { name: 'Buscar servicios' }), 'purgado')

    expect(screen.getByText('Resultados de «purgado»')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Purgado de frenos' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Alineación' })).not.toBeInTheDocument()
  })

  test('lists the services the order has, and saves what is added and dropped with the order', async () => {
    const user = userEvent.setup()
    const written = serve()
    render(<WorkOrderServices id={ order.id } />)

    expect(await within(list()).findByText('Cambio de aceite')).toBeInTheDocument()
    expect(saveButton()).toBeDisabled()       // nothing changed yet

    await user.click(screen.getByRole('button', { name: /Frenos\s*2 servicios/ }))
    await user.click(screen.getByRole('checkbox', { name: 'Cambio de pastillas' }))
    await user.click(within(list()).getByRole('button', { name: 'Quitar Cambio de aceite' }))
    await user.click(saveButton())

    await waitFor(() => expect(written).toEqual([ [ 'PUT', `/work_orders/${order.id}`, {
      services_attributes: [
        { service_template_id: front.id, name: 'Cambio de pastillas', labour_minutes: 60, items_attributes: [ { inventory_item_id: pads.id, quantity: 2 } ] },
        { id: oil.id, _destroy: true },
      ],
    } ] ]))
  })

  test('creates a new order with its vehicle, the kilometres it comes in with and its services', async () => {
    const user = userEvent.setup()
    const written = serve()
    render(<WorkOrderServices />)

    expect(screen.getByRole('heading', { name: 'Nueva orden' })).toBeInTheDocument()
    expect(screen.getByText('No has seleccionado un vehículo')).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: /Neumáticos/ }))
    await user.click(screen.getByRole('checkbox', { name: 'Alineación' }))
    expect(saveButton('Crear orden')).toBeDisabled()        // until it has a vehicle

    await user.click(screen.getByRole('button', { name: /No has seleccionado un vehículo/ }))
    const dialog = await screen.findByRole('dialog', { name: 'Seleccionar vehículo' })
    expect(within(dialog).getByText('Creados hoy o ayer')).toBeInTheDocument()
    await user.click(await within(dialog).findByRole('button', { name: /2290 LBM/ }))

    const card = screen.getByRole('region', { name: 'Vehículo' })
    expect(within(card).getByText('Seat Ibiza 1.0 TSI')).toBeInTheDocument()
    expect(within(card).getByText('Andrés Pons')).toBeInTheDocument()

    await user.type(within(card).getByRole('textbox', { name: 'Kilómetros de entrada' }), '61240')
    expect(within(card).getByRole('textbox', { name: 'Kilómetros de entrada' })).toHaveValue('61.240')

    await user.click(saveButton('Crear orden'))

    await waitFor(() => expect(written).toEqual([ [ 'POST', '/work_orders', {
      vehicle_id: ibiza.id,
      entry_kilometres: 61240,
      services_attributes: [ { service_template_id: alignment.id, name: 'Alineación', labour_minutes: 45, items_attributes: [] } ],
    } ] ]))
  })

  test('lists the vehicles created today or yesterday, and those a search finds', async () => {
    const user = userEvent.setup()
    serve()
    render(<WorkOrderServices />)

    await user.click(screen.getByRole('button', { name: /No has seleccionado un vehículo/ }))
    const dialog = await screen.findByRole('dialog')
    const vehicles = () => within(dialog).getByRole('list', { name: 'Vehículos' })

    await within(dialog).findByRole('button', { name: /4521 KLM/ })
    const since = read.find(({ pathname }) => pathname.endsWith('/vehicles'))!.searchParams.get('filter[created_at][min]')
    expect(new Date(since!)).toEqual(startOfYesterday())

    await user.type(within(dialog).getByRole('searchbox', { name: 'Buscar vehículos' }), 'golf')

    await waitFor(() => expect(within(vehicles()).getAllByRole('button').map(button => button.textContent)).toEqual([ expect.stringContaining('1184 HGT') ]))
    expect(read.at(-1)!.searchParams.has('filter[created_at][min]')).toBe(false)
  })

  test('creates a vehicle for the order, for one of the clients', async () => {
    const user = userEvent.setup()
    const written = serve()
    render(<WorkOrderServices />)

    await user.click(screen.getByRole('button', { name: /No has seleccionado un vehículo/ }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('tab', { name: 'Nuevo vehículo' }))

    const form = within(dialog).getByRole('form', { name: 'Nuevo vehículo' })
    const add = within(form).getByRole('button', { name: 'Añadir a la orden' })

    await user.type(within(form).getByRole('textbox', { name: 'Matrícula' }), '9032 mbc')
    await user.type(within(form).getByRole('textbox', { name: 'Año' }), '2022')
    await user.type(within(form).getByRole('textbox', { name: 'Marca y modelo' }), 'Peugeot 308 1.5 BlueHDi')
    await user.type(within(form).getByRole('textbox', { name: 'Kilómetros' }), '21300')
    await user.type(within(form).getByRole('textbox', { name: 'Bastidor (VIN)' }), 'vf3lbyhz')
    expect(within(form).getByText('Tiene 17 caracteres (8)')).toBeInTheDocument()
    await user.type(within(form).getByRole('textbox', { name: 'Bastidor (VIN)' }), 'pns123456')
    expect(add).toBeDisabled()              // until it has a client

    await user.type(within(form).getByRole('combobox', { name: 'Cliente' }), 'andr')
    await user.click(await within(form).findByRole('option', { name: /Andrés Pons/ }))
    await user.click(add)

    await waitFor(() => expect(written).toEqual([ [ 'POST', '/vehicles', {
      plate_number: '9032 MBC', year: 2022, make: 'Peugeot', model: '308 1.5 BlueHDi', kilometres: 21300, vin: 'VF3LBYHZPNS123456', client_id: andres.id,
    } ] ]))

    const card = await screen.findByRole('region', { name: 'Vehículo' })
    expect(within(card).getByText('9032 MBC')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('changes the vehicle of an order', async () => {
    const user = userEvent.setup()
    const written = serve()
    render(<WorkOrderServices id={ order.id } />)

    const card = await screen.findByRole('region', { name: 'Vehículo' })
    expect(card).toHaveTextContent('2019 · Híbrido · 58.900 km (últ. visita)')

    await user.click(within(card).getByRole('button', { name: 'Cambiar' }))
    const dialog = await screen.findByRole('dialog', { name: 'Cambiar vehículo' })
    expect(within(await within(dialog).findByRole('button', { name: /4521 KLM/ })).getByText('Actual')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: /2290 LBM/ }))
    await user.click(saveButton())

    await waitFor(() => expect(written).toEqual([ [ 'PUT', `/work_orders/${order.id}`, { vehicle_id: ibiza.id, services_attributes: [] } ] ]))
  })

  test('makes a new service out of the inventory, kept as a template when asked', async () => {
    const user = userEvent.setup()
    const written = serve()
    render(<WorkOrderServices id={ order.id } />)

    await screen.findByRole('button', { name: /Frenos\s*2 servicios/ })
    await user.click(screen.getByRole('button', { name: 'Crear nuevo servicio' }))

    const panel = screen.getByRole('region', { name: 'Nuevo servicio' })
    const add = within(panel).getByRole('button', { name: 'Añadir a la orden' })
    expect(add).toBeDisabled()

    await user.type(within(panel).getByRole('textbox', { name: 'Nombre del servicio' }), 'Cambio de discos')
    await user.click(within(panel).getByRole('button', { name: 'Más horas' }))
    expect(within(panel).getByRole('textbox', { name: 'Horas' })).toHaveValue('0,75')

    await user.click(within(panel).getByRole('checkbox', { name: 'Guardar como plantilla para futuras órdenes' }))
    expect(add).toBeDisabled()                // until it has a category
    await user.selectOptions(within(panel).getByRole('combobox', { name: 'Categoría de la plantilla' }), String(brakes.id))

    await user.click(await screen.findByRole('button', { name: /Frenos\s*Ver artículos/ }))
    await user.click(await screen.findByRole('checkbox', { name: 'Líquido de frenos' }))
    expect(screen.getByText('Sin stock')).toBeInTheDocument()
    expect(within(list()).getByRole('list', { name: 'Artículos del nuevo servicio' })).toHaveTextContent('Líquido de frenos')

    await user.click(add)

    expect(screen.queryByRole('region', { name: 'Nuevo servicio' })).not.toBeInTheDocument()
    expect(within(list()).getByText('Nuevo')).toBeInTheDocument()
    expect(within(list()).getByText('0,75 h · 1 artículo')).toBeInTheDocument()

    await user.click(saveButton())

    await waitFor(() => expect(written).toEqual([ [ 'PUT', `/work_orders/${order.id}`, {
      services_attributes: [ {
        name: 'Cambio de discos',
        labour_minutes: 45,
        items_attributes: [ { inventory_item_id: fluid.id, quantity: null } ],
        save_as_template: true,
        inventory_category_id: brakes.id,
      } ],
    } ] ]))
  })

  test('drops a service from the order', async () => {
    const user = userEvent.setup()
    serve()
    render(<WorkOrderServices id={ order.id } />)

    await user.click(await screen.findByRole('button', { name: /Neumáticos/ }))
    await user.click(screen.getByRole('checkbox', { name: 'Alineación' }))
    await user.click(within(list()).getByRole('button', { name: 'Quitar Alineación' }))

    expect(within(list()).queryByText('Alineación')).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Alineación' })).toHaveAttribute('aria-checked', 'false')
  })
})
