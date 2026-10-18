import { useQuery } from '@tanstack/react-query'
import api from '@/features/vehicleListings/data/vehicleListing.api'
import type { FormVehicleListing, VehicleListing } from '@/features/vehicleListings/types'
import { resourceKeys, useMutations } from '@/lib/mutations'

const listingKeys = resourceKeys('vehicleListings')

/* every listing there is: few enough to search and count by status here */
const ALL = { page: 1, perPage: 500 }

export const useVehicleListingMutations = () =>
  useMutations<VehicleListing, FormVehicleListing>(listingKeys, api)

export const useVehicleListings = () =>
  useQuery({
    queryKey: listingKeys.list(ALL),
    queryFn: () => api.getAll(ALL),
  })

export const useVehicleListing = (id?: VehicleListing['id']) =>
  useQuery({
    queryKey: [ ...listingKeys.all, 'one', id ],
    queryFn: () => api.get(id!),
    enabled: id != null,
  })
