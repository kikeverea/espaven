import { type InventoryItem, type FormInventoryItem } from './types.ts'
import api from '@/features/inventory/inventoryItems/data/inventoryItem.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { TableQuery } from '@/components/Table/hooks/useTableQuery.ts'

const inventoryItemKeys = resourceKeys('inventoryItems')

export const useInventoryItemMutations = () =>
  useMutations<InventoryItem, FormInventoryItem>(inventoryItemKeys, api, { batchDelete: true })

export const useInventoryItems = (query?: TableQuery) =>
  useQuery({
    queryKey: [...inventoryItemKeys.all, query?.page ?? 1, query?.perPage ?? null, query?.search ?? '', query?.sort ?? null],
    queryFn: () => api.getAll(query),
    placeholderData: keepPreviousData,      // keep the current page on screen while the next one loads
  })
