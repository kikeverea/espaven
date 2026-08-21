import { Field, FieldError } from '@/components/ui/field.tsx'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import type { ComponentProps } from 'react'
import type { FieldValues, Path } from "react-hook-form"
import type { FormFieldProps } from '@/components/Form/types.ts'
import FormLabel from '@/components/Form/FormLabel.tsx'

type SelectOption = {
  value: string
  label: string
}

type FormSelectProps<T extends FieldValues> =
  FormFieldProps<T, Path<T>> &
  Omit<
    ComponentProps<typeof Select>,
    'form' | 'name' | 'id' | 'aria-invalid'
  >
  & { items: SelectOption[] }

const FormSelect = <T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  required,
  ...selectProps
}: FormSelectProps<T>) => {

  const id = `form-${name}`
  const { error, invalid } = form.getFieldState(name, form.formState)
  const items = selectProps.items

  return (
    <Field data-invalid={invalid} className='py-2'>
      <FormLabel label={ label } required={ required } htmlFor={ id }/>

      <Select id={id} items={items} disabled={ !items || !items.length }>
        <SelectTrigger className="w-full max-w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            { items.length
              ? items.map((item) => (
                  <SelectItem key={ item.value } value={ item.value }>
                    { item.label }
                  </SelectItem>
                ))
              : <SelectItem key='empty-select' value=''>
                  Vacío
                </SelectItem>
            }
          </SelectGroup>
        </SelectContent>
      </Select>

      { invalid && <FieldError errors={[error]} /> }
    </Field>
  )
}

export default FormSelect