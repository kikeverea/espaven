import * as z from 'zod'
import { type DefaultValues, type FieldValues, type UseFormReturn } from 'react-hook-form'
import { type ComponentProps, type ReactNode } from 'react'
import { Input } from '@base-ui/react'
import type { Entity } from '@/types.ts'

type InferField<F extends FormField> = F extends { schema: infer S extends z.ZodType } ?
  z.infer<S> :
  never

type OptionalKeys<F extends FormFields> = {
  [K in keyof F]: undefined extends InferField<F[K]>
    ? K
    : never
}[keyof F]

type RequiredKeys<F extends FormFields> =
  Exclude<keyof F, OptionalKeys<F>>

export type InferSchema<F extends FormFields> =
  { [K in RequiredKeys<F>]: InferField<F[K]> } &
  { [K in OptionalKeys<F>]?: InferField<F[K]> }

export type FormConfig<
  T extends Entity,
  TSubmit extends Record<string, unknown>,
  F extends FormFields = FormFields,
  FData extends InferSchema<F> = InferSchema<F>,
> = {
  fields: F
  layout?: FormLayout<F>
  defaultValues?: DefaultValues<FData>
  refine?: {
    fn: (data: { [x: string]: any }) => boolean
    args?: Parameters<z.ZodType['refine']>[1]
  }
  toFormData: (item: T) => FData
  toSubmitData: (item: T, formData: FData) => TSubmit
}

export type FormField = {
  schema: z.ZodType
  variation?: FieldVariation
  type?: ComponentProps<typeof Input>['type']
  label?: string
  step?: string
  placeholder?: string
  options?: { value: string | Entity['id'], label: string }[]
  feedback?: (value: string) => ReactNode
  /* Runs when the user edits the field, never when it is set: so it can set other fields without looping */
  onChange?: (value: string, set: FieldSetter) => void
}

export type FieldSetter = (name: string, value: unknown) => void

type FieldInfoBase = {
  required?: boolean
  nullable?: boolean
}

export type FieldInfo =
  | FieldInfoBase & { kind: 'string' | 'boolean' | 'date' }
  | FieldInfoBase & { kind: 'number', step?: string }
  | FieldInfoBase & { kind: 'enum', options: { value: string | Entity['id'], label: string }[] }
  | FieldInfoBase & { kind: 'array', element: () => ReactNode }

export type FormFields = Record<string, FormField>

/* Rows of field names: a name alone takes a line of its own, the names of an array share one */
export type FormLayout<F extends FormFields> = (FieldName<F> | FieldName<F>[])[]

type FieldName<F extends FormFields> = keyof F & string

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
  field: FormField
}