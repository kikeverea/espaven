import { api } from '@/api/apiClient'
import { createResource } from '@/api/resource'
import type { ForbiddenApiFields } from '@/api/entity.mapper'
import type { FormVehicleListing, VehicleListing } from '@/features/vehicleListings/types'
import { toMultipart, vehicleListingMapper } from '@/features/vehicleListings/data/vehicleListing.mapper'

const PATH = '/vehicle_listings'

const resource = createResource<VehicleListing, FormVehicleListing, VehicleListing, ForbiddenApiFields>(PATH, vehicleListingMapper)
const { apiFetch } = api<VehicleListing, VehicleListing, ForbiddenApiFields>(vehicleListingMapper)

/* written as multipart forms, photos and all */
export default {
  ...resource,

  create: (listing: FormVehicleListing): Promise<VehicleListing> =>
    apiFetch(PATH, { method: 'POST', body: toMultipart(listing) }),

  update: (id: VehicleListing['id'], listing: FormVehicleListing): Promise<VehicleListing> =>
    apiFetch(`${PATH}/${id}`, { method: 'PUT', body: toMultipart(listing) }),
}
