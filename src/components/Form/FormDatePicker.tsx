import type { FieldPathByValue, FieldValues, PathValue } from 'react-hook-form'
import type { FormFieldProps } from '@/components/Form/types'
import FormLabel from '@/components/Form/FormLabel'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, isDate } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldError } from '@/components/ui/field.tsx'
import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input.tsx'


type DatePath<T extends FieldValues> =
  FieldPathByValue<T, Date | undefined | null>

type FormDatePickerProps<T extends FieldValues> =
  FormFieldProps<T, DatePath<T>> &
  Omit<ComponentProps<typeof Input>, 'form' | 'name' | 'id' | 'aria-invalid'>

const FormDatePicker = <T extends FieldValues>({
  form,
  name,
  label,
  required,
}: FormDatePickerProps<T>) => {

  const id = `form-${name}`
  const { error, invalid } = form.getFieldState(name, form.formState)
  const value = form.watch(name)

  return (
    <Field>
      <FormLabel label={label} required={required} htmlFor={id}>
        {label}
        {required && <span>*</span>}
      </FormLabel>

      <Popover>
        <PopoverTrigger>
          {isDate(value) ? format(value, 'PPP') : 'Select date'}
        </PopoverTrigger>
        { invalid && <FieldError errors={[error]} /> }

        <PopoverContent>
          <Calendar
            mode="single"
            selected={value as Date | undefined}
            onSelect={(date) =>
              form.setValue(name, date as PathValue<T, typeof name>, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}

export default FormDatePicker