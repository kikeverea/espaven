import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/render.tsx'
import { createFactories } from '@/test/factories'
import VehicleListingsIndex from '@/features/vehicleListings/VehicleListingsIndex'

describe('VehicleListingsIndex', () => {

  const { vehicleListing } = createFactories()

  const peugeot = vehicleListing({
    name: 'Peugeot 308 1.5 BlueHDi', status: 'published', priceCents: 1290000, plateNumber: '9032 MBC',
    year: 2019, kilometres: 96400, fuel: 'diesel', gearbox: 'manual',
    photos: [ { id: 2, slot: 'side', url: '/side.jpg' }, { id: 1, slot: null, url: '/other.jpg' }, { id: 3, slot: 'front34', url: '/front.jpg' } ],
  })
  const citroen = vehicleListing({ name: 'Citroën C4 Cactus', status: 'published', priceCents: 1190000, plateNumber: '6411 LJD' })
  const clio = vehicleListing({ name: 'Renault Clio 1.5 dCi', status: 'reserved', plateNumber: '7713 JWS' })
  const golf = vehicleListing({ name: 'Volkswagen Golf 1.6 TDI', status: 'draft' })

  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })

  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => json({ collection: [ peugeot, citroen, clio, golf ] }))
  })

  afterEach(() => { vi.restoreAllMocks() })

  const tiles = () => within(screen.getByRole('list', { name: 'Vehículos' })).queryAllByRole('link').map(link => link.getAttribute('aria-label'))
  const tab = (name: RegExp) => screen.getByRole('tab', { name })

  test('heads with how many vehicles there are and how many are published', async () => {
    render(<VehicleListingsIndex />)

    expect(await screen.findByText('4 vehículos · 2 publicados')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Añadir vehículo/ })).toHaveAttribute('href', '/vehicle_listings/new')
  })

  test('shows each as a tile: cover, price, status, what it is and its plate, opening its form', async () => {
    render(<VehicleListingsIndex />)

    const tile = await screen.findByRole('link', { name: 'Peugeot 308 1.5 BlueHDi' })

    expect(tile).toHaveAttribute('href', `/vehicle_listings/${peugeot.id}`)
    expect(within(tile).getByRole('img')).toHaveAttribute('src', '/front.jpg')
    expect(within(tile).getByText('12.900 €')).toBeInTheDocument()
    expect(within(tile).getByText('Publicado')).toBeInTheDocument()
    expect(tile).toHaveTextContent('2019·96.400 km·Diésel·Manual')
    expect(within(tile).getByText('9032 MBC')).toBeInTheDocument()
  })

  test('narrows down by status, each tab with its count', async () => {
    const user = userEvent.setup()
    render(<VehicleListingsIndex />)
    await screen.findByRole('link', { name: 'Peugeot 308 1.5 BlueHDi' })

    expect(tab(/Todos/)).toHaveTextContent('4')
    expect(tab(/Publicado/)).toHaveTextContent('2')
    expect(tab(/Vendido/)).toHaveTextContent('0')

    await user.click(tab(/Reservado/))

    expect(tab(/Reservado/)).toHaveAttribute('aria-selected', 'true')
    expect(tiles()).toEqual([ 'Renault Clio 1.5 dCi' ])
  })

  test('searches by name without minding accents, and by plate with or without its space', async () => {
    const user = userEvent.setup()
    render(<VehicleListingsIndex />)
    await screen.findByRole('link', { name: 'Peugeot 308 1.5 BlueHDi' })

    const search = screen.getByRole('searchbox', { name: 'Buscar vehículos' })

    await user.type(search, 'citroen')
    expect(tiles()).toEqual([ 'Citroën C4 Cactus' ])

    await user.clear(search)
    await user.type(search, '7713jws')
    expect(tiles()).toEqual([ 'Renault Clio 1.5 dCi' ])
    expect(tab(/Todos/)).toHaveTextContent('1')

    await user.clear(search)
    await user.type(search, 'tesla')
    expect(screen.getByText('Ningún vehículo coincide con la búsqueda.')).toBeInTheDocument()
  })
})
