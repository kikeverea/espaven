import { Field, FieldDescription, FieldError } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'

import type { ComponentProps } from 'react'
import { type FieldValues, type Path, useWatch } from 'react-hook-form'
import type { FormFieldProps } from '@/components/Form/types.ts'
import FormLabel from '@/components/Form/FormLabel.tsx'
import { isValid } from '@/components/Form/util.ts'

type FormInputProps<T extends FieldValues> =
  FormFieldProps<T, Path<T>> &
  Omit<
    ComponentProps<typeof Input>,
    'form' | 'name' | 'id' | 'aria-invalid'
  >

const FormInput = <T extends FieldValues>({
  form,
  field,
  name,
  label,
  placeholder,
  required,
  ...inputProps
}: FormInputProps<T>) => {

  const value = useWatch({ control: form.control, name })    // re-renders this input only
  const feedback = field.feedback && isValid(value, field.schema) && field.feedback(value)

  const id = `form-${name}`
  const { error, invalid } = form.getFieldState(name, form.formState)

  return (
    <Field data-invalid={invalid} className='py-2'>
      <FormLabel label={ label } required={ required } htmlFor={ id }/>

      <Input
        {...form.register(name)}
        {...inputProps}
        placeholder={ placeholder }
        id={id}
        aria-invalid={ invalid }
      />

      { invalid
        ? <FieldError errors={[ error ]} />
        : feedback && <FieldDescription>{ feedback }</FieldDescription>
      }
    </Field>
  )
}

export default FormInput