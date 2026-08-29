import * as z from 'zod'
import type { FormConfig, FormFields } from '@/components/Form/types.ts'

export const defineFormConfig = <T extends FormFields>(
  config: FormConfig<T>
) => config

export const extractSchema = (config: FormConfig<FormFields>) => {
  const schema = z.object(
    Object.fromEntries(
      Object.entries(config.fields).map(([key, field]) => [key, field.schema]),
    ),
  )

  return config.refine
    ? schema.refine(config.refine.fn, config.refine?.args || {})
    : schema
}

export const pickValues = <T extends Record<string, unknown>>(item: T, fields: FormFields): Record<string,unknown> =>
  Object.keys(fields).reduce((defaultValues, field) => {
    console.log('setting', field, item[field])

    defaultValues[field] = item[field]
    return defaultValues
  }, {} as Record<string, unknown>)

export const getFieldInfo = (baseSchema: z.ZodType) => {
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
      options: schema.options,
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