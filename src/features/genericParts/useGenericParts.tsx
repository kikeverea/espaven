import { type GenericPart, type FormGenericPart } from './types.ts'
import api from '@/features/genericParts/data/genericPart.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { TableQuery } from '@/components/Table/hooks/useTableQuery'

const genericPartKeys = resourceKeys('genericParts')

export const useGenericPartMutations = () =>
  useMutations<GenericPart, FormGenericPart>(genericPartKeys, api, { batchDelete: true })

export const useGenericParts = (query?: TableQuery) =>
  useQuery({
    queryKey: [...genericPartKeys.all, query?.page ?? 1, query?.perPage ?? null, query?.search ?? '', query?.sort ?? null],
    queryFn: () => api.getAll(query),
    placeholderData: keepPreviousData,      // keep the current page on screen while the next one loads
  })
