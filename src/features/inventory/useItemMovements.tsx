import {
  type InventoryItem,
  type InventoryMovement,
  type FormInventoryMovement
} from './types.ts'
import api from '@/features/inventory/movements/data/movements.service'
import { useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const movementsKeys = {
  all: ['inventoryMovements'] as const,
  create: ['inventoryMovements', 'create'] as const,
  update: ['inventoryMovements', 'update'] as const,
  delete: ['inventoryMovements', 'delete'] as const,
}

const movementsApi = (item: InventoryItem) => ({
  create: (payload: FormInventoryMovement) => api.createMovement(item.id, payload),
  update: (id: InventoryMovement['id'], payload: FormInventoryMovement) => api.updateMovement(item.id, id, payload),
  delete: api.deleteMovement,
  deleteAll: api.deleteMovements
})

export const useInventoryItemMovementMutations = (item: InventoryItem) => {
  return useMutations<InventoryMovement, FormInventoryMovement>(
    movementsKeys,
    movementsApi(item),
    { batchDelete: true }
  )
}

export const useItemMovements = (item: InventoryItem | null) => useQuery({
  queryKey: ['inventoryMovements'],
  queryFn: () => api.getMovements(item?.id)
})