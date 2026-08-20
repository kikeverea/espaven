import { Field, FieldError, FieldLabel } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'
import { X, Plus } from 'lucide-react'

import {
  type FieldArray,
  type FieldArrayPath,
  type FieldValues,
  type Path,
  type UseFieldArrayReturn,
} from 'react-hook-form'
import type { FormFieldProps } from '@/components/Form/types.ts'

type MultiInputProps<T extends FieldValues> = FormFieldProps<T, FieldArrayPath<T>> & {
  values: UseFieldArrayReturn<T>
  addMessage: string
}

const FormMultiInput = <T extends FieldValues>({
  form,
  values,
  name,
  label,
  addMessage
}: MultiInputProps<T>) => {

  const { error, invalid } = form.getFieldState(name as Path<T>, form.formState)

  return (
    <Field className='py-2'>
      <FieldLabel>{label}</FieldLabel>

      { values.fields.map((field, index) => {
        const fieldName = `${name}.${index}.value` as Path<T>
        const { error, invalid } = form.getFieldState(fieldName, form.formState)

        return (
          <div key={field.id} className="flex gap-2">
            <Input {...form.register(fieldName)} aria-invalid={invalid} />

            <Button type="button" variant="ghost" size="icon" onClick={() => values.remove(index)}>
              <X />
            </Button>

            { invalid && <FieldError errors={[error]} /> }
          </div>
        )
      })}

      <Button
        type="button"
        variant="outline"
        size='sm'
        className='
          max-w-full md:max-w-fit md:px-4 md:max-h-7
          text-primary/80 border-primary/80 hover:text-white hover:bg-primary/90
          transition-colors duration-250'
        onClick={() => values.append({ value: "" } as FieldArray<T>)}
      >
        <Plus />
        { addMessage }
      </Button>

      { invalid && <FieldError errors={[error]} /> }

    </Field>
  )
}

export default FormMultiInput