import { Field, FieldError } from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'

import type { ComponentProps } from 'react'
import { Controller, type FieldValues, type Path } from 'react-hook-form'
import type { FormFieldProps } from '@/components/Form/types.ts'
import FormLabel from '@/components/Form/FormLabel.tsx'

type FormCheckboxProps<T extends FieldValues> =
  FormFieldProps<T, Path<T>> &
  Omit<
    ComponentProps<typeof Checkbox>,
    'form' | 'name' | 'id' | 'aria-invalid'
  >

const FormCheckbox = <T extends FieldValues>({
  form,
  name,
  label,
  required
}: FormCheckboxProps<T>) => {

  const id = `form-${name}`
  const { error, invalid } = form.getFieldState(name, form.formState)

  return (
    <Field data-invalid={invalid} className='py-2'>
      <Field orientation="horizontal">
        <Controller
          control={form.control}
          name={name}
          render={({ field }) => (
            <Checkbox
              id={id}
              name={field.name}
              inputRef={field.ref}
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
              disabled={field.disabled}
              aria-invalid={invalid}
            />
          )}
        />
        <FormLabel label={ label } required={ required } htmlFor={ id }/>
      </Field>

      { invalid && <FieldError errors={[error]} /> }
    </Field>
  )
}

export default FormCheckbox
