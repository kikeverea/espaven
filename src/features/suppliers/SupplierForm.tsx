import type { Supplier } from '@/features/suppliers/types'
import { useSupplierMutations } from '@/features/suppliers/useSuppliers'
import { config } from '@/features/suppliers/data/supplier.form'
import CardForm from '@/components/Form/CardForm'
import type { FormCallbacks } from '@/components/Form/Form'
import type { ComponentProps } from 'react'

type SupplierFormProps = FormCallbacks & ComponentProps<'div'> & {
  name: string
  supplier: Partial<Supplier> | null
  className?: string
}

const SupplierForm = ({
  name='supplier',
  supplier,
  onCreate,
  onUpdate,
  onCancel,
  className
}: SupplierFormProps) => {

  return (
    <CardForm
      name={ name }
      className={ className }
      itemName={[ 'Proveedor', 'm' ]}
      justify='fluid'
      config={ config }
      item={ supplier }
      mutations={ useSupplierMutations() }
      onCreate={ onCreate }
      onUpdate={ onUpdate }
      onCancel={ onCancel }
    />
  )
}

export default SupplierForm
