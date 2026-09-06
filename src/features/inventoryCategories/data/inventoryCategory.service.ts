import type { InventoryCategory } from '../types'
import { api } from '@/api/apiClient'

const { apiFetch, fetch } = api()

const getInventoryCategories = (): Promise<InventoryCategory[]> =>
  apiFetch<InventoryCategory[]>(`/inventory_categories`)

const getInventoryCategory = (id: InventoryCategory['id']): Promise<InventoryCategory> =>
  apiFetch<InventoryCategory>(`/inventory_categories/${id}`)

const createInventoryCategory = async (payload: Partial<InventoryCategory>): Promise<InventoryCategory> => {
  return apiFetch<InventoryCategory>(`/inventory_categories`, {
    method: 'POST',
    body: payload
  })
}

const updateInventoryCategory = async (id: InventoryCategory['id'], inventoryCategory: Partial<InventoryCategory>): Promise<InventoryCategory> => {
  return apiFetch<InventoryCategory>(`/inventory_categories/${id}`, {
    method: 'PUT',
    body: inventoryCategory,
  })
}

const deleteInventoryCategory = async (inventoryCategory: Partial<InventoryCategory>): Promise<InventoryCategory> => {
  return apiFetch<InventoryCategory>(`/inventory_categories/${inventoryCategory.id}`, { method: 'DELETE' })
}

const deleteInquiries = async (ids: InventoryCategory['id'][]): Promise<boolean[]> => {
  return fetch<boolean[]>(`/inventory_categories/batch_destroy`, {
    method: 'POST',
    body: { ids: ids }
  })
}

export default {
  getInventoryCategories,
  getInventoryCategory,
  createInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
  deleteInquiries
}
