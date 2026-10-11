import { type InventoryItem, type FormInventoryItem } from './types.ts'
import api from '@/features/inventory/inventoryItems/data/inventoryItem.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { QueryArgs } from '@/api/apiClient.ts'

const inventoryItemKeys = resourceKeys('inventoryItems')

export const useInventoryItemMutations = () =>
  useMutations<InventoryItem, FormInventoryItem>(inventoryItemKeys, api, { batchDelete: true })

export const useInventoryItems = (args?: QueryArgs) => {

  const { query, staleTime } = args || {}

  return useQuery({
    queryKey: inventoryItemKeys.list(query),
    queryFn: () => api.getAll(query),
    placeholderData: keepPreviousData,      // keep the current page on screen while the next one loads
    staleTime: staleTime ?? 0
  })
}
