import {
  PHOTO_SLOTS,
  type EmissionsTag,
  type FormVehicleListing,
  type Fuel,
  type Gearbox,
  type ListingStatus,
  type PhotoSlot,
  type PhotoWrite,
  type VehicleListing,
} from '@/features/vehicleListings/types'

/* A photo on the form: one the listing has (id), or one just dropped in (file) */
export type PhotoEntry = {
  key: string
  slot: PhotoSlot | null
  url: string
  id?: number
  file?: File
}

/* The listing as it is being typed: numbers as their text, until they are saved */
export type ListingDraft = {
  name: string
  status: ListingStatus
  price: string                 // whole euros, digits only
  plateNumber: string
  year: string
  kilometres: string
  power: string
  itvUntil: string              // as typed, 'MM/AAAA'
  fuel: Fuel | null
  gearbox: Gearbox | null
  doors: 3 | 5 | null
  emissionsTag: EmissionsTag | null
  equipment: string[]
  description: string
  photos: PhotoEntry[]
}

const text = (value?: number | string | null) => value == null ? '' : String(value)

/* '2027-05' ⇄ '05/2027' */
const itvText = (itv?: string | null) => {
  const [ year, month ] = itv?.split('-') ?? []
  return year && month ? `${month}/${year}` : ''
}

export const itvValue = (typed: string): string | null => {
  const [ , month, year ] = typed.trim().match(/^(\d{1,2})\/(\d{4})$/) ?? []
  return month && Number(month) >= 1 && Number(month) <= 12 ? `${year}-${month.padStart(2, '0')}` : null
}

export const draftOf = (listing?: VehicleListing | null): ListingDraft => ({
  name: listing?.name ?? '',
  status: listing?.status ?? 'draft',
  price: listing?.priceCents == null ? '' : String(Math.round(listing.priceCents / 100)),
  plateNumber: listing?.plateNumber ?? '',
  year: text(listing?.year),
  kilometres: text(listing?.kilometres),
  power: text(listing?.power),
  itvUntil: itvText(listing?.itvUntil),
  fuel: listing?.fuel ?? null,
  gearbox: listing?.gearbox ?? null,
  doors: listing?.doors ?? null,
  emissionsTag: listing?.emissionsTag ?? null,
  equipment: listing?.equipment ?? [],
  description: listing?.description ?? '',
  photos: (listing?.photos ?? []).map(photo => ({ key: `photo-${photo.id}`, ...photo })),
})

const number = (typed: string) => typed.trim() === '' ? null : Number(typed)

/* What the photos came to: the ones the listing had and are gone, then the ones dropped in */
const photoWrites = (photos: PhotoEntry[], had: VehicleListing['photos']): PhotoWrite[] => [
  ...had.filter(({ id }) => !photos.some(photo => photo.id === id)).map(({ id }) => ({ id, remove: true as const })),
  ...photos.flatMap(({ slot, file }) => file ? [ { slot, file } ] : []),
]

/* The draft as it is written, the whole of it */
export const toWrite = (draft: ListingDraft, listing?: VehicleListing | null): FormVehicleListing => ({
  name: draft.name.trim(),
  status: draft.status,
  priceCents: draft.price ? Number(draft.price) * 100 : null,
  plateNumber: draft.plateNumber.trim().toUpperCase() || null,
  year: number(draft.year),
  kilometres: number(draft.kilometres),
  power: number(draft.power),
  itvUntil: itvValue(draft.itvUntil),
  fuel: draft.fuel,
  gearbox: draft.gearbox,
  doors: draft.doors,
  emissionsTag: draft.emissionsTag,
  equipment: draft.equipment,
  description: draft.description.trim() || null,
  photos: photoWrites(draft.photos, listing?.photos ?? []),
})

/* the views filled in, of the eight */
export const viewsFilled = (photos: PhotoEntry[]) => PHOTO_SLOTS.filter(slot => photos.some(photo => photo.slot === slot)).length

export const specsFilled = (draft: ListingDraft) => [
  draft.year, draft.kilometres, draft.power, itvValue(draft.itvUntil),
  draft.fuel, draft.gearbox, draft.doors, draft.emissionsTag,
].filter(value => value != null && value !== '').length

/* What a listing wants before it is published, and whether this one has it */
export const checklist = (draft: ListingDraft): { label: string, done: boolean }[] => [
  { label: 'Nombre y precio', done: !!draft.name.trim() && !!draft.price },
  { label: 'Fotos de todas las vistas', done: viewsFilled(draft.photos) === PHOTO_SLOTS.length },
  { label: 'Ficha técnica completa', done: specsFilled(draft) === 8 },
  { label: 'Equipamiento (3 o más)', done: draft.equipment.length >= 3 },
  { label: 'Descripción (más de 40 caracteres)', done: draft.description.trim().length > 40 },
]
