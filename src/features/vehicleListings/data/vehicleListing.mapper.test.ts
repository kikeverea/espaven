import { toMultipart, vehicleListingMapper } from '@/features/vehicleListings/data/vehicleListing.mapper'
import type { VehicleListing } from '@/features/vehicleListings/types'

describe('vehicleListing.mapper', () => {

  const entries = (form: FormData) => [ ...form.entries() ]

  test('writes a listing as a Rails style multipart form', () => {
    const form = toMultipart({ name: 'Seat Ibiza', priceCents: 1150000, emissionsTag: 'c', itvUntil: null, equipment: [ 'Navegador', 'Bluetooth' ] })

    expect(entries(form)).toEqual([
      [ 'vehicle_listing[name]', 'Seat Ibiza' ],
      [ 'vehicle_listing[price_cents]', '1150000' ],
      [ 'vehicle_listing[emissions_tag]', 'c' ],
      [ 'vehicle_listing[itv_until]', '' ],
      [ 'vehicle_listing[equipment][]', 'Navegador' ],
      [ 'vehicle_listing[equipment][]', 'Bluetooth' ],
    ])
  })

  test('clears a list with one blank value, which a form could not send otherwise', () => {
    expect(entries(toMultipart({ equipment: [] }))).toEqual([ [ 'vehicle_listing[equipment][]', '' ] ])
  })

  test('sends the photos as nested attributes: the new with their image and snake cased slot, the dropped to destroy', () => {
    const file = new File([ 'jpg' ], 'seats.jpg', { type: 'image/jpeg' })
    const form = toMultipart({ photos: [ { id: 7, remove: true }, { slot: 'rearSeats', file }, { slot: null, file } ] })

    expect(entries(form)).toEqual([
      [ 'vehicle_listing[photos_attributes][0][id]', '7' ],
      [ 'vehicle_listing[photos_attributes][0][_destroy]', 'true' ],
      [ 'vehicle_listing[photos_attributes][1][slot]', 'rear_seats' ],
      [ 'vehicle_listing[photos_attributes][1][image]', expect.any(File) ],
      [ 'vehicle_listing[photos_attributes][2][slot]', '' ],
      [ 'vehicle_listing[photos_attributes][2][image]', expect.any(File) ],
    ])
  })

  test('reads the slots camel cased, and what is missing as empty', () => {
    const listing = vehicleListingMapper.fromApi!({
      id: 1, name: 'Golf', status: 'draft', createdAt: '',
      photos: [ { id: 3, slot: 'rear_seats', url: '/a.jpg' }, { id: 4, slot: null, url: '/b.jpg' } ],
    } as unknown as VehicleListing)

    expect(listing.photos.map(({ slot }) => slot)).toEqual([ 'rearSeats', null ])
    expect(listing.equipment).toEqual([])
  })
})
