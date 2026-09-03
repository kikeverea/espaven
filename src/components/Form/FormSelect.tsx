import { Field, FieldError } from '@/components/ui/field.tsx'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import type { ComponentProps } from 'react'
import { Controller, type FieldValues, type Path } from 'react-hook-form'
import type { FormFieldProps } from '@/components/Form/types.ts'
import FormLabel from '@/components/Form/FormLabel.tsx'
import type { Entity } from '@/types.ts'

type SelectOption = {
  value: string | Entity['id']
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

      <Controller
        control={form.control}
        name={name}
        render={({ field }) => (
          <Select
            items={items}
            value={field.value ?? null}
            onValueChange={field.onChange}
            disabled={!items.length}
          >
            <SelectTrigger id={id} className="w-full max-w-48">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {items.map(item => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />

      { invalid && <FieldError errors={[error]} /> }
    </Field>
  )
}

export default FormSelect