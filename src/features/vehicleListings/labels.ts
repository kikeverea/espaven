import { PHOTO_SLOTS, type EmissionsTag, type Fuel, type Gearbox, type ListingPhoto, type ListingStatus, type PhotoSlot, type VehicleListing } from '@/features/vehicleListings/types'

export const STATUS_LABELS: Record<ListingStatus, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  reserved: 'Reservado',
  sold: 'Vendido',
}

export const FUEL_LABELS: Record<Fuel, string> = {
  petrol: 'Gasolina',
  diesel: 'Diésel',
  hybrid: 'Híbrido',
  electric: 'Eléctrico',
  lpg: 'GLP',
}

export const GEARBOX_LABELS: Record<Gearbox, string> = {
  manual: 'Manual',
  automatic: 'Automático',
}

export const EMISSIONS_TAG_LABELS: Record<EmissionsTag, string> = {
  zero: '0',
  eco: 'ECO',
  c: 'C',
  b: 'B',
  none: 'Sin',
}

export const SLOT_LABELS: Record<PhotoSlot, string> = {
  front34: '3/4 delantero',
  side: 'Lateral',
  rear34: '3/4 trasero',
  interior: 'Interior',
  rearSeats: 'Asientos traseros',
  dashboard: 'Cuadro / km',
  engine: 'Motor',
  boot: 'Maletero',
}

/* '12.900 €' */
export const euros = (cents?: number | null) =>
  cents == null ? '' : `${Math.round(cents / 100).toLocaleString('es-ES', { useGrouping: true })} €`

/* '96.400 km' */
export const kilometres = (km?: number | null) =>
  km == null ? '' : `${km.toLocaleString('es-ES', { useGrouping: true })} km`

/* The photo a listing is shown by: the first view there is, in the order of the slots, else one of the others */
export const coverOf = (photos: Pick<ListingPhoto, 'slot' | 'url'>[]) =>
  PHOTO_SLOTS.map(slot => photos.find(photo => photo.slot === slot)).find(Boolean)?.url
  ?? photos.find(photo => !photo.slot)?.url

/* '2019 · 96.400 km · Diésel · Manual', what there is of it */
export const specLine = (listing: Partial<VehicleListing>) => [
  listing.year,
  kilometres(listing.kilometres),
  listing.fuel && FUEL_LABELS[listing.fuel],
  listing.gearbox && GEARBOX_LABELS[listing.gearbox],
].filter(Boolean).map(String)

/* digits only: '12.900 €' typed or pasted is 12900 */
export const digits = (typed: string) => typed.replace(/\D/g, '')

/* '12900' as '12.900' */
export const thousands = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
