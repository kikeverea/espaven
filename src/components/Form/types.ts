import * as z from 'zod'
import { type DefaultValues, type FieldValues, type UseFormReturn } from 'react-hook-form'
import { type ComponentProps } from 'react'
import { Input } from '@base-ui/react'

export type InferSchema<T extends FormFields> = {
  [K in keyof T]: z.infer<T[K]['schema']>
}

export type FormConfig<T extends FormFields> = {
  fields: T
  defaultValues?: DefaultValues<InferSchema<T>>
  refine?: {
    fn: (data: { [x: string]: any }) => boolean
    args?: Parameters<z.ZodType['refine']>[1]
  }
}

export type FormField = {
  schema: z.ZodType
  variation?: FieldVariation
  type?: ComponentProps<typeof Input>['type']
  label?: string
  placeholder?: string
}

export type FormFields = Record<string, FormField>

export type FieldVariation =
  | 'email'
  | 'textarea'
  | 'options'

export type FormFieldProps<T extends FieldValues, NPath> = {
  form: UseFormReturn<T>
  label?: string
  placeholder?: string
  name: NPath,
  required?: boolean
}