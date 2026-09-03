import type { FormInventoryItem, InventoryItem } from '../types.ts'
import { api } from '@/api/apiClient.ts'

const { apiFetch, fetch } = api()

const getInventoryItems = async (): Promise<InventoryItem[]> => {
  return await apiFetch<InventoryItem[]>(`/inventory_items`)
}

const getInventoryItem = async (id: InventoryItem['id']): Promise<InventoryItem> => {
  return await apiFetch<InventoryItem>(`/inventory_items/${id}`)
}

const createInventoryItem = async (payload: FormInventoryItem): Promise<InventoryItem> => {
  return await apiFetch<InventoryItem>(`/inventory_items`, {
    method: 'POST',
    body: payload
  })
}

const updateInventoryItem = async (id: InventoryItem['id'], inventoryItem: FormInventoryItem):
  Promise<InventoryItem> =>
{
  return await apiFetch<InventoryItem>(`/inventory_items/${id}`, {
    method: 'PUT',
    body: inventoryItem,
  })
}

const deleteInventoryItem = async (inventoryItem: InventoryItem): Promise<InventoryItem> => {
  return await apiFetch<InventoryItem>(`/inventory_items/${inventoryItem.id}`, { method: 'DELETE' })
}

const deleteInventoryItems = async (ids: InventoryItem['id'][]): Promise<boolean[]> => {
  return await fetch<boolean[]>(`/inventory_items/batch_destroy`, {
    method: 'POST',
    body: { ids: ids }
  })
}

export default {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  deleteInventoryItems
}
