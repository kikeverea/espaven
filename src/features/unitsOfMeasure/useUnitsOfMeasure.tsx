import { type UnitOfMeasure, type FormUnitOfMeasure } from './types.ts'
import api from '@/features/unitsOfMeasure/data/units.service.ts'
import { useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const unitOfMeasureKeys = {
  all: ['unitsOfMeasure'] as const,
  create: ['unitsOfMeasure', 'create'] as const,
  update: ['unitsOfMeasure', 'update'] as const,
  delete: ['unitsOfMeasure', 'delete'] as const,
}

const unitOfMeasureApi = {
  create: api.createUnitOfMeasure,
  update: api.updateUnitOfMeasure,
  delete: api.deleteUnitOfMeasure,
  deleteAll: api.deleteUnitOfMeasures
}

export const useUnitsOfMeasureMutations = () => {
  return useMutations<UnitOfMeasure, FormUnitOfMeasure>(unitOfMeasureKeys, unitOfMeasureApi, { batchDelete: true })
}

export const useUnitsOfMeasure = () => {
  const { data: unitsOfMeasure, isPending, isError } = useQuery({ queryKey: unitOfMeasureKeys.all, queryFn: api.getUnitOfMeasures })
  return { unitsOfMeasure, isPending, isError }
}