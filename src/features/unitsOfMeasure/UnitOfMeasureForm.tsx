import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FormUnitOfMeasure, UnitOfMeasure } from '@/features/unitsOfMeasure/types'
import { useUnitsOfMeasureMutations } from '@/features/unitsOfMeasure/useUnitsOfMeasure'
import Form from '@/components/Form/Form'
import { defineForm } from '@/features/unitsOfMeasure/data/units.form'
import type { ComponentProps } from 'react'

type useUnitsOfMeasureFormProps<T> = ComponentProps<"div"> & {
  name: string
  unit: T | null
  onCancel?: () => void
  existingNames: string[]
}

const UnitOfMeasureForm = <T extends UnitOfMeasure | FormUnitOfMeasure>(
  { name, unit, onCancel, existingNames, ...props }: useUnitsOfMeasureFormProps<T>) =>
{

  const formConfig = defineForm({ name: existingNames })

  return (
    <div className={
      `grid justify-items-center
      transition-[grid-template-rows] duration-300
      ${unit ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}
      ${props.className}
      `
    }>
      <Card className={`my-4 xl:my-0 w-full pt-0 min-h-0 transition-[padding,box-shadow] duration-300
        ${unit ? '' : 'py-0 ring-0'}`}>
        <CardHeader className='bg-primary/85 py-2 text-white'>
          <CardTitle className='text-center text-2xl font-semibold'>
            { (unit && 'id' in unit) ? 'Editar' : 'Nueva'} unidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form
            name={ name }
            itemName={['unidad', 'f']}
            config={ formConfig }
            item={unit || {} as T}
            mutations={useUnitsOfMeasureMutations()}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default UnitOfMeasureForm
