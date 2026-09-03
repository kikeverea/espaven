import type { InventoryItem } from '@/features/inventory/types'
import { useInventoryItemMutations } from '@/features/inventory/useInventory'
import { config } from '@/features/inventory/data/inventory.form'
import { useUnitsOfMeasure } from '@/features/unitsOfMeasure/useUnitsOfMeasure.tsx'
import CardForm from '@/components/Form/CardForm.tsx'
import type { FormCallbacks } from '@/components/Form/Form.tsx'

type InventoryItemFormProps = FormCallbacks & {
  item: Partial<InventoryItem> | null
  onCancel: () => void
}

const InventoryItemForm = ({ item, onUpdate, onCancel }: InventoryItemFormProps) => {

  const { unitsOfMeasure } = useUnitsOfMeasure()

  return (
    <CardForm
      name='item'
      itemName='artículo'
      config={ config(unitsOfMeasure || []) }
      item={item}
      mutations={useInventoryItemMutations()}
      onUpdate={onUpdate}
      onCancel={onCancel}
    />
  )
}

export default InventoryItemForm
