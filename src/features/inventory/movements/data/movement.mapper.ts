import type { ApiMapper } from '@/api/apiClient.ts'
import { type ForbiddenApiFields, prepareForApi } from '@/api/entity.mapper.ts'
import type { InventoryMovement } from '@/features/inventory/types.ts'

export const mapperFactory = <
  TDomain extends InventoryMovement, TApiIn, TApiOut extends object & ForbiddenApiFields
>(): ApiMapper<TDomain, TApiIn, TApiOut> =>
{
  return {
    toApi: (movement: Partial<TDomain>): TApiOut => {
      console.log('INPUT', movement)
      const apiAcceptable = prepareForApi(movement)

      if (!movement.inventoryItem)
        throw new Error('Inventory item must be present')

      console.log('MOVEMENT', movement)

      return {
        ...apiAcceptable,
        item_id: movement.inventoryItem.id
      } as unknown as TApiOut
    }
  }
}