import type { PersistedRecord } from '@/types'

export type ListingStatus = 'published' | 'draft' | 'reserved' | 'sold'
export type Fuel = 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'lpg'
export type Gearbox = 'manual' | 'automatic'
export type EmissionsTag = 'zero' | 'eco' | 'c' | 'b' | 'none'      // the DGT's distintivo ambiental

/* The views a listing is photographed from, in the order the cover is chosen by */
export const PHOTO_SLOTS = [ 'front34', 'side', 'rear34', 'interior', 'rearSeats', 'dashboard', 'engine', 'boot' ] as const
export type PhotoSlot = typeof PHOTO_SLOTS[number]

/* A photo of one of the views, or one of the others when it has no slot */
export type ListingPhoto = {
  id: number
  slot: PhotoSlot | null
  url: string
}

/* A vehicle for sale, as the client site shows it */
export type VehicleListing =
  PersistedRecord &
  {
    name: string
    status: ListingStatus
    priceCents?: number | null
    plateNumber?: string | null
    year?: number | null
    kilometres?: number | null
    power?: number | null               // CV
    itvUntil?: string | null            // 'YYYY-MM'
    fuel?: Fuel | null
    gearbox?: Gearbox | null
    doors?: 3 | 5 | null
    emissionsTag?: EmissionsTag | null
    equipment: string[]
    description?: string | null
    photos: ListingPhoto[]
    updatedAt?: string
  }

/* A photo as it is written: a new one for a slot (or none, one of the others), or one taken off */
export type PhotoWrite =
  | { slot: PhotoSlot | null, file: File }
  | { id: ListingPhoto['id'], remove: true }

export type FormVehicleListing =
  Partial<Omit<VehicleListing, 'photos' | 'id' | 'createdAt' | 'updatedAt'>> & {
    photos?: PhotoWrite[]
  }
