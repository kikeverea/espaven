import { type UnitOfMeasure, type FormUnitOfMeasure } from './types.ts'
import api from '@/features/unitsOfMeasure/data/units.service.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const unitOfMeasureKeys = resourceKeys('unitsOfMeasure')

export const useUnitsOfMeasureMutations = () =>
  useMutations<UnitOfMeasure, FormUnitOfMeasure>(unitOfMeasureKeys, api, { batchDelete: true })

export const useUnitsOfMeasure = () => {
  const { data, isPending, isError } = useQuery({ queryKey: unitOfMeasureKeys.all, queryFn: () => api.getAll() })
  return { unitsOfMeasure: data?.collection, isPending, isError }
}
