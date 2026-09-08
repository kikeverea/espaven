import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import Form, { type FormCallbacks } from '@/components/Form/Form.tsx'

import type { Entity } from '@/types.ts'
import type { FormConfig, FormFields, InferSchema } from '@/components/Form/types.ts'
import type { Mutations } from '@/lib/mutations.tsx'

type CardFormProps<
  T extends Entity,
  TSubmit extends Record<string, unknown>,
  F extends FormFields
> = {
  name: string
  item: Partial<T> | null
  itemName: string | readonly [string, 'm'|'f']
  config: FormConfig<T, TSubmit, F, InferSchema<F>>
  mutations: Mutations<T, TSubmit>,
  justify?: 'center' | 'fluid'
  className?: string
} & FormCallbacks

const CardForm = <
  T extends Entity,
  TSubmit extends Record<string, unknown>,
  F extends FormFields
>({
  name: formName,
  item,
  itemName,
  config,
  mutations,
  onCreate,
  onUpdate,
  onCancel,
  justify='center',
  className=''
}: CardFormProps<T, TSubmit, F>) => {

  const [name, gender] = Array.isArray(itemName) ? itemName : [itemName, 'm']

  return (
    <div className={`
      ${className}
      grid ${justify === 'center' ? 'justify-items-center' : ''}
      transition-[grid-template-rows] duration-300
      ${item ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`
    }>
      <Card className={`
        w-full ${justify === 'center' ? 'xl:w-1/2 my-4' : 'my-4 xl:my-0'} pt-0 min-h-0 transition-[padding,box-shadow] duration-300
        ${item ? '' : 'm-0 py-0 ring-0'}
      `}>
        <CardHeader className='bg-primary/85 py-2 text-white'>
          <CardTitle className='text-center text-2xl font-semibold'>
            { item?.id != null ? 'Editar' : gender === 'm' ? 'Nuevo' : 'Nueva' } { name }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form
            name={formName}
            itemName={itemName}
            config={config}
            item={item || {}}
            mutations={mutations}
            onCancel={onCancel}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default CardForm
