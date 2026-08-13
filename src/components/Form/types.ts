import type { FieldValues, UseFormReturn } from 'react-hook-form'

export type FormFieldProps<T extends FieldValues, NPath> = {
  form: UseFormReturn<T>
  label: string
  name: NPath,
  required?: boolean
}