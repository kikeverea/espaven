import type { InventoryCategory } from '@/features/inventoryCategories/types'
import { useInventoryCategoryMutations } from '@/features/inventoryCategories/useInventoryCategories'
import { config } from '@/features/inventoryCategories/data/inventoryCategory.form'
import CardForm from '@/components/Form/CardForm'
import type { FormCallbacks } from '@/components/Form/Form'
import type { ComponentProps } from 'react'

type InventoryCategoryFormProps = FormCallbacks & ComponentProps<'div'> & {
  inventoryCategory: Partial<InventoryCategory> | null
}

const InventoryCategoryForm = ({ inventoryCategory, onCreate, onUpdate, onCancel }: InventoryCategoryFormProps) => {
  return (
    <CardForm
      name='inventoryCategory'
      itemName={['Categoría', 'f']}
      justify='fluid'
      config={ config }
      item={inventoryCategory}
      mutations={useInventoryCategoryMutations()}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onCancel={onCancel}
    />
  )
}

export default InventoryCategoryForm