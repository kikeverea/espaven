import * as z from 'zod'
import type { FieldInfo, FormConfig, FormField, FormFields, InferSchema } from '@/components/Form/types.ts'
import type { Entity } from '@/types.ts'

type PartialConfig<P extends { toFormData: P['toFormData'], toSubmitData: P['toSubmitData'] }> =
  & Omit<P, 'toFormData' | 'toSubmitData'>
  & { toFormData? : P['toFormData'] }
  & { toSubmitData? : P['toSubmitData'] }

export const defineFormConfig = <
  T extends Entity,
  TSubmit extends Record<string, unknown>,
  F extends FormFields = FormFields,
  FData extends InferSchema<F> = InferSchema<F>,
>
(config: PartialConfig<FormConfig<T, TSubmit, F, FData>>):
  FormConfig<T, TSubmit, F, FData> =>
{

  const {
    toFormData = (item: T) => (pickValues(item, config.fields) as FData),
    toSubmitData = (item: T, formData: FData) => ({ ...item, ...formData } as TSubmit),
    ...rest
  } = config

  return { toFormData, toSubmitData, ...rest }
}

export const extractSchema = <
  T extends Entity,
  TSubmit extends Record<string, unknown>,
  F extends FormFields = FormFields,
  FData extends InferSchema<F> = InferSchema<F>
>(config: FormConfig<T, TSubmit, F, FData>) =>
{
  const schema = z.object(
    Object.fromEntries(
      Object.entries(config.fields).map(([key, field]) => [key, field.schema]),
    ),
  )

  return config.refine
    ? schema.refine(config.refine.fn, config.refine?.args || {})
    : schema
}

export const pickValues = <T extends Entity, F extends FormFields>(item: T, fields: F): InferSchema<F> => {
  return Object.keys(fields).reduce((values, field) => {
    const key = field as keyof InferSchema<F>
    values[key] = item[field] as InferSchema<F>[typeof key]

    return values
  }, {} as InferSchema<F>)
}

export const getFieldInfo = (field: FormField): FieldInfo => {

  const baseSchema: z.ZodType = field.schema

  const info = {
    required: !baseSchema.isOptional(),
    nullable: baseSchema.isNullable(),
  }

  const schema = unwrapSchema(baseSchema)

  if (schema instanceof z.ZodString) {
    return {
      ...info,
      kind: 'string' as const,
    }
  }

  if (schema instanceof z.ZodNumber) {
    return {
      ...info,
      kind: 'number' as const,
    }
  }

  if (schema instanceof z.ZodBoolean) {
    return {
      ...info,
      kind: 'boolean' as const,
    }
  }

  if (schema instanceof z.ZodEnum) {
    return {
      ...info,
      kind: 'enum' as const,
      options: field.options || [],
    }
  }

  if (schema instanceof z.ZodDate) {
    return {
      ...info,
      kind: 'date' as const,
    }
  }

  if (schema instanceof z.ZodArray) {
    return {
      ...info,
      kind: 'array' as const,
      element: schema.element,
    }
  }

  throw new Error(`Invalid field kind: ${JSON.stringify(schema)}`)
}

function unwrapSchema(schema: z.ZodType): z.ZodType {
  let current = schema

  while (true) {
    if (current instanceof z.ZodOptional) {
      current = current.unwrap()
      continue
    }

    if (current instanceof z.ZodNullable) {
      current = current.unwrap()
      continue
    }

    if (current instanceof z.ZodDefault) {
      current = current.removeDefault()
      continue
    }

    if (current instanceof z.ZodEffects) {
      current = current.innerType()
      continue
    }

    return current
  }
}