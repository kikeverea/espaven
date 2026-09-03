import { type InventoryItem, type FormInventoryItem } from './types.ts'
import api from '@/features/inventory/data/inventory.service.ts'
import { useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const inventoryKeys = {
  all: ['inventoryItems'] as const,
  create: ['inventoryItems', 'create'] as const,
  update: ['inventoryItems', 'update'] as const,
  delete: ['inventoryItems', 'delete'] as const,
}

const inventoryApi = {
  create: api.createInventoryItem,
  update: api.updateInventoryItem,
  delete: api.deleteInventoryItem,
  deleteAll: api.deleteInventoryItems
}

export const useInventoryItemMutations = () => {
  return useMutations<InventoryItem, FormInventoryItem>(inventoryKeys, inventoryApi, { batchDelete: true })
}

export const useInventory = () => useQuery({ queryKey: inventoryKeys.all, queryFn: api.getInventoryItems })