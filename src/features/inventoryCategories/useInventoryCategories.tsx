import { type InventoryCategory, type FormInventoryCategory } from './types.ts'
import api from '@/features/inventoryCategories/data/inventoryCategory.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const inventoryCategoryKeys = resourceKeys('inventoryCategories')

export const useInventoryCategoryMutations = () =>
  useMutations<InventoryCategory, FormInventoryCategory>(inventoryCategoryKeys, api, { batchDelete: true })

export const useInventoryCategories = () =>
  useQuery({ queryKey: inventoryCategoryKeys.all, queryFn: () => api.getAll() })
