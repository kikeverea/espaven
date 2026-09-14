import type { InventoryItem } from '@/features/inventory/inventoryItems/types.ts'
import { useInventoryItemMutations } from '@/features/inventory/inventoryItems/useInventoryItems.tsx'
import { config } from '@/features/inventory/inventoryItems/data/inventoryItem.form.ts'
import CardForm from '@/components/Form/CardForm.tsx'
import type { FormCallbacks } from '@/components/Form/Form.tsx'
import type { ComponentProps } from 'react'
import { useInventoryCategories } from '@/features/inventoryCategories/useInventoryCategories.tsx'
import { useUnitsOfMeasure } from '@/features/unitsOfMeasure/useUnitsOfMeasure.tsx'

type InventoryItemFormProps = FormCallbacks & ComponentProps<'div'> & {
  name: string
  inventoryItem: Partial<InventoryItem> | null
  className?: string
}

const InventoryItemForm = ({
  name='inventoryItem',
  inventoryItem,
  onCreate,
  onUpdate,
  onCancel,
  className
}: InventoryItemFormProps) => {

  const { data: inventoryCategories } = useInventoryCategories()
  const { unitsOfMeasure } = useUnitsOfMeasure()

  return (
    <CardForm
      name={ name }
      className={ className }
      itemName={[ 'Parte', 'f' ]}
      justify='fluid'
      config={ config(inventoryCategories?.collection || [], unitsOfMeasure || []) }
      item={inventoryItem}
      mutations={useInventoryItemMutations()}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onCancel={onCancel}
    />
  )
}

export default InventoryItemForm