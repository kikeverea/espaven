import { type InventoryCategory, type FormInventoryCategory } from './types.ts'
import api from '@/features/inventoryCategories/data/inventoryCategory.service.ts'
import { useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const inquiryKeys = {
  all: ['inquiries'] as const,
  create: ['inquiries', 'create'] as const,
  update: ['inquiries', 'update'] as const,
  delete: ['inquiries', 'delete'] as const,
}

const inquiriesApi = {
  create: api.createInventoryCategory,
  update: api.updateInventoryCategory,
  delete: api.deleteInventoryCategory,
  deleteAll: api.deleteInquiries
}

export const useInventoryCategoryMutations = () => {
  return useMutations<InventoryCategory, FormInventoryCategory>(inquiryKeys, inquiriesApi, { batchDelete: true })
}

export const useInventoryCategories = () =>
  useQuery({ queryKey: inquiryKeys.all, queryFn: api.getInventoryCategories })