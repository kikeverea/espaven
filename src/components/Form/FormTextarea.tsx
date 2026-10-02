import { Field, FieldDescription, FieldError } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

import type { ComponentProps } from 'react'
import { useWatch, type FieldValues, type Path } from 'react-hook-form'
import type { FormFieldProps } from '@/components/Form/types'
import FormLabel from '@/components/Form/FormLabel.tsx'
import { isValid } from '@/components/Form/util.ts'

type FormTextareaProps<T extends FieldValues> =
  FormFieldProps<T, Path<T>> &
  { maxLength?: number } &
  Omit<
    ComponentProps<typeof Textarea>,
    'form' | 'name' | 'id' | 'aria-invalid'
  >

const FormTextarea = <T extends FieldValues>({
  form,
  field,
  name,
  maxLength,
  label,
  placeholder,
  required,
  ...textareaProps
}: FormTextareaProps<T>) => {

  const id = `form-${name}`
  const { error, invalid } = form.getFieldState(name, form.formState)
  const value = useWatch({ control: form.control, name }) ?? ''      // re-renders this field only
  const feedback = field.feedback && isValid(value, field.schema) && field.feedback(value)

  return (
    <Field data-invalid={invalid} className='py-2'>
      <FormLabel label={ label } required={ required } htmlFor={ id }/>

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

      { invalid
        ? <FieldError errors={[ error ]} />
        : feedback && <FieldDescription>{ feedback }</FieldDescription>
      }
    </Field>
  )
}

export default FormTextarea