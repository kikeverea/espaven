import type { PersistedRecord } from '@/types'
import type { Contact } from '@/features/inquiries/types'

export type Vehicle =
  PersistedRecord &
  {
    client: Contact
    plateNumber?: string
    description?: string
    make?: string
    makeDescription?: string
    model?: string
    modelDescription?: string
    engineSize?: string
    registrationDate?: string
    variation?: string
    variantType?: string
    vehicleType?: string
    seats?: number
    fuel?: string
    doors?: number
    dynamicPower?: number
    imageUrl?: string
    kType?: string
    indicativePrice?: number
    allTerrain?: boolean
    stolen?: string
  }

export type FormVehicle = Partial<Vehicle>
