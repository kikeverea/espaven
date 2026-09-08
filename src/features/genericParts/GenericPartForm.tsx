import type { GenericPart } from '@/features/genericParts/types'
import { useGenericPartMutations } from '@/features/genericParts/useGenericParts'
import { config } from '@/features/genericParts/data/genericPart.form'
import CardForm from '@/components/Form/CardForm'
import type { FormCallbacks } from '@/components/Form/Form'
import type { ComponentProps } from 'react'
import { useInventoryCategories } from '@/features/inventoryCategories/useInventoryCategories.tsx'

type GenericPartFormProps = FormCallbacks & ComponentProps<'div'> & {
  name: string
  genericPart: Partial<GenericPart> | null
  className?: string
}

const GenericPartForm = ({
  name='genericPart',
  genericPart,
  onCreate,
  onUpdate,
  onCancel,
  className
}: GenericPartFormProps) => {

  const { data: inventoryCategories } = useInventoryCategories()

  return (
    <CardForm
      name={ name }
      className={ className }
      itemName={[ 'Parte', 'f' ]}
      justify='fluid'
      config={ config(inventoryCategories?.collection) }
      item={genericPart}
      mutations={useGenericPartMutations()}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onCancel={onCancel}
    />
  )
}

export default GenericPartForm