import { type InventoryItem, type FormInventoryItem } from './types.ts'
import api from '@/features/inventory/data/inventoryItem.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const inventoryKeys = resourceKeys('inventoryItems')

export const useInventoryItemMutations = () =>
  useMutations<InventoryItem, FormInventoryItem>(inventoryKeys, api, { batchDelete: true })

export const useInventory = () =>
  useQuery({ queryKey: inventoryKeys.all, queryFn: () => api.getAll() })
