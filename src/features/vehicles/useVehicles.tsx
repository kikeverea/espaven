import { type Vehicle, type FormVehicle } from './types.ts'
import api from '@/features/vehicles/data/vehicle.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { CollectionQuery } from '@/api/apiClient.ts'

const vehicleKeys = resourceKeys('vehicles')

export const useVehicleMutations = () =>
  useMutations<Vehicle, FormVehicle>(vehicleKeys, api, { batchDelete: true })

export const useVehicles = (query?: CollectionQuery) =>
  useQuery({
    queryKey: vehicleKeys.list(query),
    queryFn: () => api.getAll(query),
    placeholderData: keepPreviousData,      // keep the current page on screen while the next one loads
  })
