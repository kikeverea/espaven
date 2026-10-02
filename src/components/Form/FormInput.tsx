import { Field, FieldDescription, FieldError } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'

import type { ComponentProps } from 'react'
import { type FieldValues, type Path, type PathValue, useWatch } from 'react-hook-form'
import type { FieldSetter, FormFieldProps } from '@/components/Form/types.ts'
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

  /* validates what it sets once the form was submitted, the way typing does */
  const set: FieldSetter = (other, value) =>
    form.setValue(other as Path<T>, value as PathValue<T, Path<T>>, {
      shouldDirty: true,
      shouldValidate: form.formState.isSubmitted,
    })

  /* register's onChange fires on the user's edits only, not on setValue: setting each other never loops */
  const registered = form.register(name, {
    onChange: event => {
      const input = event.target.value
      if (field.onChange && isValid(input, field.schema))
        field.onChange(input, set)
    }
  })

  return (
    <Field data-invalid={invalid} className='py-2'>
      <FormLabel label={ label } required={ required } htmlFor={ id }/>

      <Input
        {...registered}
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