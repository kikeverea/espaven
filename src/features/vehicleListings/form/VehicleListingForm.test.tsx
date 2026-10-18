import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/render.tsx'
import { createFactories } from '@/test/factories'
import VehicleListingForm from '@/features/vehicleListings/form/VehicleListingForm'

describe('VehicleListingForm', () => {

  const { vehicleListing } = createFactories()

  const peugeot = vehicleListing({
    name: 'Peugeot 308', status: 'published', priceCents: 1290000, plateNumber: '9032 MBC', fuel: 'diesel', itvUntil: '2027-05',
    equipment: [ 'Navegador' ],
    photos: [ { id: 31, slot: 'front34', url: '/front.jpg' }, { id: 32, slot: null, url: '/other.jpg' } ],
  })

  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })
  const photo = (name: string) => new File([ 'jpg' ], name, { type: 'image/jpeg' })

  /* The api behind the form. Returns what is written: method, path and the form sent */
  const serve = () => {
    const written: [ string, string, FormData | undefined ][] = []

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const path = new URL(String(input)).pathname.replace(/^\/api/, '')

      if (init?.method && init.method !== 'GET')
        written.push([ init.method, path, init.body as FormData | undefined ])

      return json(path.startsWith('/vehicle_listings/') ? peugeot : { collection: [] })
    })

    return written
  }

  let urls = 0

  beforeEach(() => {
    urls = 0
    URL.createObjectURL = vi.fn(() => `blob:photo-${++urls}`)
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => { vi.restoreAllMocks() })

  const save = () => screen.getByRole('button', { name: 'Guardar' })
  const sent = (form: FormData | undefined, key: string) => form?.getAll(`vehicle_listing[${key}]`)
  const preview = () => screen.getByRole('article', { name: 'Tarjeta en la web' })
  const photos = () => screen.getByRole('region', { name: /Fotos/ })

  test('saves a new one once it has a name, with all it was given', async () => {
    const user = userEvent.setup()
    const written = serve()
    render(<VehicleListingForm />)

    expect(screen.getByRole('heading', { name: 'Nuevo vehículo' })).toBeInTheDocument()
    expect(save()).toBeDisabled()

    await user.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Seat Ibiza 1.0 TSI')
    await user.type(screen.getByRole('textbox', { name: 'Precio' }), '11500')
    await user.type(screen.getByRole('textbox', { name: 'Matrícula' }), '2290 lbm')
    await user.type(screen.getByRole('textbox', { name: 'ITV hasta' }), '5/2027')
    await user.click(within(screen.getByRole('radiogroup', { name: 'Combustible' })).getByRole('radio', { name: 'Gasolina' }))
    await user.click(within(screen.getByRole('radiogroup', { name: 'Puertas' })).getByRole('radio', { name: '5' }))
    await user.type(screen.getByRole('textbox', { name: 'Nuevo equipamiento' }), 'Techo solar{Enter}')
    await user.click(screen.getByRole('button', { name: 'Navegador' }))
    await user.upload(screen.getByLabelText('Foto Lateral'), photo('side.jpg'))

    expect(screen.getByRole('textbox', { name: 'Precio' })).toHaveValue('11.500')

    await user.click(save())

    await waitFor(() => expect(written).toHaveLength(1))
    const [ method, path, form ] = written[0]

    expect([ method, path ]).toEqual([ 'POST', '/vehicle_listings' ])
    expect(sent(form, 'name')).toEqual([ 'Seat Ibiza 1.0 TSI' ])
    expect(sent(form, 'status')).toEqual([ 'draft' ])
    expect(sent(form, 'price_cents')).toEqual([ '1150000' ])
    expect(sent(form, 'plate_number')).toEqual([ '2290 LBM' ])
    expect(sent(form, 'itv_until')).toEqual([ '2027-05' ])
    expect(sent(form, 'fuel')).toEqual([ 'petrol' ])
    expect(sent(form, 'doors')).toEqual([ '5' ])
    expect(sent(form, 'gearbox')).toEqual([ '' ])
    expect(sent(form, 'equipment][')).toEqual([ 'Techo solar', 'Navegador' ])
    expect(sent(form, 'photos_attributes][0][slot')).toEqual([ 'side' ])
    expect(sent(form, 'photos_attributes][0][image')).toEqual([ expect.any(File) ])
  })

  test('previews the card as the client site shows it, and what is left before publishing', async () => {
    const user = userEvent.setup()
    serve()
    render(<VehicleListingForm />)

    expect(within(preview()).getByText('Nombre del vehículo')).toBeInTheDocument()
    expect(screen.getByText('0 de 5')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Seat Ibiza')
    await user.type(screen.getByRole('textbox', { name: 'Precio' }), '11500')
    await user.type(screen.getByRole('textbox', { name: 'Kilómetros' }), '54200')
    await user.upload(screen.getByLabelText('Foto Interior'), photo('interior.jpg'))
    await user.upload(screen.getByLabelText('Foto 3/4 trasero'), photo('rear.jpg'))

    expect(within(preview()).getByRole('heading', { name: 'Seat Ibiza' })).toBeInTheDocument()
    expect(within(preview()).getByText('11.500 €')).toBeInTheDocument()
    expect(within(preview()).getByText('54.200 km')).toBeInTheDocument()
    // the cover is the first view in order, 3/4 trasero before Interior
    expect(within(preview()).getByRole('img')).toHaveAttribute('src', 'blob:photo-2')
    expect(screen.getByText('1 de 5')).toBeInTheDocument()
    expect(within(photos()).getByText('2/8')).toBeInTheDocument()
  })

  test('takes equipment once, whatever its case, and lets it go', async () => {
    const user = userEvent.setup()
    serve()
    render(<VehicleListingForm />)

    const input = screen.getByRole('textbox', { name: 'Nuevo equipamiento' })
    await user.type(input, 'bluetooth{Enter}')
    await user.type(input, 'BLUETOOTH{Enter}')

    const equipment = screen.getByRole('list', { name: 'Equipamiento' })
    expect(within(equipment).getAllByRole('listitem')).toHaveLength(1)
    expect(within(screen.getByRole('group', { name: 'Sugerencias' })).queryByRole('button', { name: 'Bluetooth' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Quitar bluetooth' }))
    expect(screen.queryByRole('list', { name: 'Equipamiento' })).not.toBeInTheDocument()
  })

  test('edits an existing one: its photos replaced or taken off go as such', async () => {
    const user = userEvent.setup()
    const written = serve()
    render(<VehicleListingForm id={ peugeot.id } />)

    expect(await screen.findByRole('heading', { name: 'Editar vehículo' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Precio' })).toHaveValue('12.900')
    expect(screen.getByRole('textbox', { name: 'ITV hasta' })).toHaveValue('05/2027')
    expect(screen.getByRole('radio', { name: 'Publicado' })).toHaveAttribute('aria-checked', 'true')

    await user.upload(screen.getByLabelText('Foto 3/4 delantero'), photo('front.jpg'))
    await user.click(screen.getByRole('button', { name: 'Quitar foto Otra 1' }))
    await user.click(screen.getByRole('radio', { name: 'Reservado' }))
    await user.click(save())

    await waitFor(() => expect(written).toHaveLength(1))
    const [ method, path, form ] = written[0]

    expect([ method, path ]).toEqual([ 'PUT', `/vehicle_listings/${peugeot.id}` ])
    expect(sent(form, 'status')).toEqual([ 'reserved' ])
    expect(sent(form, 'photos_attributes][0][id')).toEqual([ '31' ])
    expect(sent(form, 'photos_attributes][0][_destroy')).toEqual([ 'true' ])
    expect(sent(form, 'photos_attributes][1][id')).toEqual([ '32' ])
    expect(sent(form, 'photos_attributes][2][slot')).toEqual([ 'front34' ])
  })

  test('deletes an existing one once it is confirmed', async () => {
    const user = userEvent.setup()
    const written = serve()
    render(<VehicleListingForm id={ peugeot.id } />)

    await user.click(await screen.findByRole('button', { name: /Eliminar/ }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

    await waitFor(() => expect(written).toEqual([ [ 'DELETE', `/vehicle_listings/${peugeot.id}`, undefined ] ]))
  })

  test('has nothing to delete while it is new', () => {
    serve()
    render(<VehicleListingForm />)

    expect(screen.queryByRole('button', { name: /Eliminar/ })).not.toBeInTheDocument()
  })
})
