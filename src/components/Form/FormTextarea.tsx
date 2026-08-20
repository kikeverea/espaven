import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

import type { ComponentProps } from 'react'
import type { FieldValues, Path } from 'react-hook-form'
import type { FormFieldProps } from '@/components/Form/types'

type FormTextareaProps<T extends FieldValues> =
  FormFieldProps<T, Path<T>> &
  { maxLength?: number } &
  Omit<
    ComponentProps<typeof Textarea>,
    'form' | 'name' | 'id' | 'aria-invalid'
  >

const FormTextarea = <T extends FieldValues>({
  form,
  name,
  maxLength,
  label,
  placeholder,
  required,
  ...textareaProps
}: FormTextareaProps<T>) => {

  const id = `form-${name}`
  const { error, invalid } = form.getFieldState(name, form.formState)
  const value = form.watch(name) ?? ''

  return (
    <Field data-invalid={invalid} className='py-2'>
      {label && (
        <FieldLabel htmlFor={id}>
          {label}
          {required && <span className='text-destructive'>*</span>}
        </FieldLabel>
      )}

      <Textarea
        {...form.register(name)}
        {...textareaProps }
        maxLength={ maxLength }
        placeholder={placeholder}
        id={id}
        aria-invalid={invalid}
      />

      { maxLength && (
        <span className="text-xs text-muted-foreground w-full text-end pe-1">
          {String(value).length}/{maxLength}
        </span>
      )}

      { invalid && <FieldError errors={[error]} /> }
    </Field>
  )
}

export default FormTextarea