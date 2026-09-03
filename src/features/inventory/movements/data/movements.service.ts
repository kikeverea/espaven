import { api } from '@/api/apiClient'
import type { FormInventoryMovement, InventoryItem, InventoryMovement } from '@/features/inventory/types'
import { mapperFactory } from '@/features/inventory/movements/data/movement.mapper.ts'

const { apiFetch, fetch } = api(mapperFactory())

const getMovements = async (itemId: InventoryItem['id'] | undefined): Promise<InventoryMovement[]> => {
  if (!itemId) return []
  return await apiFetch<InventoryMovement[]>(`/inventory_items/${itemId}/inventory_movements`)
}

const getMovement = async (itemId: InventoryItem['id'], id: InventoryMovement['id']): Promise<InventoryMovement> => {
  return await apiFetch<InventoryMovement>(`/inventory_items/${itemId}/inventory_movements/${id}`)
}

const createMovement = async (itemId: InventoryItem['id'], payload: FormInventoryMovement): Promise<InventoryMovement> => {
  return await apiFetch<InventoryMovement>(`/inventory_items/${itemId}/inventory_movements/`, {
    method: 'POST',
    body: payload
  })
}

const updateMovement = async (
  itemId: InventoryItem['id'],
  id: InventoryMovement['id'],
  inventoryItem: FormInventoryMovement
):
  Promise<InventoryMovement> =>
{
  return await apiFetch<InventoryMovement>(`/inventory_items/${itemId}/inventory_movements/${id}`, {
    method: 'PUT',
    body: inventoryItem,
  })
}

const deleteMovement = async (movement: InventoryMovement): Promise<InventoryMovement> => {
  return await apiFetch<InventoryMovement>(
    `/inventory_items/${movement.inventoryItem.id}/inventory_movements${movement.id}`,
    { method: 'DELETE' }
  )
}

const deleteMovements = async (ids: InventoryItem['id'][]): Promise<boolean[]> => {
  return await fetch<boolean[]>(`/inventory_items/inventory_movements/batch_destroy`, {
    method: 'POST',
    body: { ids: ids }
  })
}

export default {
  getMovements,
  getMovement,
  createMovement,
  updateMovement,
  deleteMovement,
  deleteMovements
}
