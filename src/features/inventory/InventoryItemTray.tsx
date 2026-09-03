import * as z from 'zod'
import type { FormInventoryMovement, InventoryItem, InventoryMovement } from '@/features/inventory/types'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import Form from '@/components/Form/Form.tsx'
import { defineFormConfig } from '@/components/Form/util.ts'
import { useInventoryItemMovementMutations } from '@/features/inventory/useItemMovements.tsx'

type DetailsTrayProps = {
  item: InventoryItem,
  closeTray: () => void
}

const InventoryItemTray = ({ item, closeTray }: DetailsTrayProps) => {

  const [stockAction, setStockAction] = useState<InventoryMovement['movement'] | null>(null)

  const mutations = useInventoryItemMovementMutations(item)

  const formConfirmButton  = stockAction === 'in'
    ? { label: 'Añadir', variant: 'success' as const }
    : { label: 'Quitar', variant: 'destructive' as const }

  return item &&
    <>
      <div className='flex gap-4 items-start'>
        <div className='flex-1'>
          <div className='font-semibold'>
            {item.name}
          </div>
        </div>
        <button className='ps-2 pb-2 cursor-pointer' onClick={ closeTray }>
          <X className='text-gray-400 size-5'/>
        </button>
      </div>
      <div className='flex gap-4 mt-6 mb-2'>
        <Button
          className='flex-1'
          size='sm'
          variant={stockAction === 'in' ? 'success' : 'outlineSuccess' }
          onClick={()=> setStockAction(stockAction === 'in' ? null : 'in')}
        >
          Añadir stock
        </Button>
        <Button
          className='flex-1'
          size='sm'
          variant={stockAction === 'out' ? 'destructiveSolid' : 'outlineDestructive' }
          onClick={()=> setStockAction(stockAction === 'out' ? null : 'out')}
        >
          Quitar stock
        </Button>
      </div>

      { stockAction && mutations &&
        <Form
          name='stockAction'
          itemName='movimiento'
          config={defineFormConfig<InventoryMovement, FormInventoryMovement>({
            fields: {
              amountDelta: {
                label: 'Stock',
                schema: z.coerce.number().min(0, 'No puede ser menor de 0'),
                step: '0.01'
              },
            },
            toSubmitData: (inventoryMovement, formData) => {
              const { movement, amountDelta, ...rest } = inventoryMovement
              const { amountDelta: delta, ...data } = formData

              return {
                movement: stockAction,
                amountDelta: stockAction === 'in' ? delta : delta * -1,
                ...rest,
                ...data
              }
            }
          })}
          item={{ inventoryItem: item }}
          mutations={mutations}
          confirmButton={ formConfirmButton }
          onCancel={ () => setStockAction(null) }
        />
      }
    </>
}

export default InventoryItemTray