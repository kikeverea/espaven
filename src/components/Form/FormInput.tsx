import { Field, FieldError, FieldLabel } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'

import type { ComponentProps } from 'react'
import type { FieldValues, Path } from "react-hook-form"
import type { FormFieldProps } from '@/components/Form/types.ts'

type FormInputProps<T extends FieldValues> =
  FormFieldProps<T, Path<T>> &
  Omit<
    ComponentProps<typeof Input>,
    'form' | 'name' | 'id' | 'aria-invalid'
  >

const FormInput = <T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  required,
  ...inputProps
}: FormInputProps<T>) => {

  const id = `form-${name}`
  const { error, invalid } = form.getFieldState(name, form.formState)

  return (
    <Field data-invalid={invalid} className='py-2'>
      { label &&
        <FieldLabel htmlFor={id}>
          {label}
          {required && <span className="text-destructive">*</span>}
        </FieldLabel>
      }

      <Input
        {...form.register(name)}
        {...inputProps}
        placeholder={ placeholder }
        id={id}
        aria-invalid={ invalid }
      />

      { invalid && <FieldError errors={[error]} /> }
    </Field>
  )
}

export default FormInput