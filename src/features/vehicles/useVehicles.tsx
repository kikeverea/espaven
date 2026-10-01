import { type Vehicle, type FormVehicle } from './types.ts'
import api from '@/features/vehicles/data/vehicle.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { TableQuery } from '@/components/Table/hooks/useTableQuery'

const vehicleKeys = resourceKeys('vehicles')

export const useVehicleMutations = () =>
  useMutations<Vehicle, FormVehicle>(vehicleKeys, api, { batchDelete: true })

export const useVehicles = (query?: TableQuery) =>
  useQuery({
    queryKey: [...vehicleKeys.all, query?.page ?? 1, query?.perPage ?? null, query?.search ?? '', query?.sort ?? null],
    queryFn: () => api.getAll(query),
    placeholderData: keepPreviousData,      // keep the current page on screen while the next one loads
  })
