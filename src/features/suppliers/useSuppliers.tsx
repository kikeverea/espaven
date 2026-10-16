import { type Supplier, type FormSupplier } from './types.ts'
import api from '@/features/suppliers/data/supplier.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { QueryArgs } from '@/api/apiClient.ts'

const supplierKeys = resourceKeys('suppliers')

export const useSupplierMutations = () =>
  useMutations<Supplier, FormSupplier>(supplierKeys, api, { batchDelete: true })

export const useSuppliers = (args?: QueryArgs) => {

  const { query, staleTime } = args || {}

  return useQuery({
    queryKey: supplierKeys.list(query),
    queryFn: () => api.getAll(query),
    placeholderData: keepPreviousData,      // keep the current page on screen while the next one loads
    staleTime: staleTime ?? 0
  })
}
