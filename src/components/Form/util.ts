import * as z from 'zod'
import type { DefaultValues } from 'react-hook-form'
import type { FieldInfo, FormConfig, FormField, FormFields, InferSchema } from '@/components/Form/types.ts'
import type { Entity } from '@/types'

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
    fields,
    defaultValues,
    toFormData = (item: T) => (pickValues(item, fields) as FData),
    toSubmitData = (item: T, formData: FData) => ({ ...item, ...formData } as TSubmit),
    ...rest
  } = config

  const resolvedDefaults = {
    ...emptyValues(fields),
    ...defaultValues
  } as DefaultValues<FData>

  return {
    fields,
    defaultValues: resolvedDefaults,
    toFormData: (item: T) => withDefaults(toFormData(item), resolvedDefaults),
    toSubmitData,
    ...rest
  }
}

/**
 * Empty value of each field, inferred from its schema. Guarantees every field is present on
 * `defaultValues` and on every `form.reset`, so inputs never fall back to their previous value
 */
export const emptyValues = <F extends FormFields>(fields: F): DefaultValues<InferSchema<F>> =>
  Object.fromEntries(
    Object.entries(fields).map(([ name, field ]) => [ name, emptyValue(field) ])
  ) as DefaultValues<InferSchema<F>>

export const emptyValue = (field: FormField): unknown => {
  const { kind } = getFieldInfo(field)

  switch (kind) {
    case 'string':
    case 'number':
      /* Numbers included: a blank input reads as '', and `extractSchema` treats it as a missing value */
      return ''
    case 'boolean':
      return false
    case 'array':
      return []
    case 'enum':
    case 'date':
      /* Left empty on purpose: null would report 'expected date, received null' instead of 'required' */
      return undefined
    default:
      throw new Error(`Invalid field kind: ${kind}`)
  }
}

function withDefaults<FData>(formData: FData, defaults: DefaultValues<FData>): FData {
  const values = Object.fromEntries(
    Object.entries(formData as Record<string, unknown>).filter(([ , value ]) => value !== undefined)
  )

  return { ...defaults, ...values } as FData
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
      Object.entries(config.fields).map(([key, field]) => [key, validationSchema(field)]),
    ),
  )

  return config.refine
    ? schema.refine(config.refine.fn, config.refine?.args || {})
    : schema
}

/**
 * An empty number input holds '', which `z.coerce.number()` reads as 0. Blank values are treated as
 * missing instead, so a required number is rejected rather than silently submitted as a 0
 */
function validationSchema(field: FormField): z.ZodType {
  const info = getFieldInfo(field)

  if (info.kind !== 'number')
    return field.schema

  const isBlank = (value: unknown) => value === '' || (value == null && !info.nullable)

  return info.required
    ? z.any().refine(value => !isBlank(value), { message: 'Requerido' }).pipe(field.schema)
    : z.preprocess(value => isBlank(value) ? undefined : value, field.schema)
}

export const isValid = <S extends z.ZodType>(value: unknown, schema: S): boolean => {
  const parsed = schema.safeParse(value)
  return parsed.success
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
  const { schema, nullable } = unwrapSchema(baseSchema)

  const info = {
    required: !baseSchema.isOptional(),
    nullable,
  }

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

export const selectOptions = <T extends Entity>(
  collection: T[],
  labelExtractor: (item: T) => string = item => item['name'] as string
) => {
  return collection.reduce((options, item) => {
      const id = String(item.id)

      options.options.push({ label: labelExtractor(item), value: id })
      options.ids.push(id)

      return options
    },
    { ids: [], options: [] } as
    { ids: string[],options: { label: string, value: string | Entity['id'] }[] })
}

/*
 * `isNullable()` cannot be trusted here: it parses a null, and a coerced number reads it as a 0.
 * The wrappers are walked instead
 */
function unwrapSchema(schema: z.ZodType): { schema: z.ZodType, nullable: boolean } {
  let current = schema
  let nullable = false

  while (true) {
    if (current instanceof z.ZodOptional) {
      current = current.unwrap()
      continue
    }

    if (current instanceof z.ZodNullable) {
      current = current.unwrap()
      nullable = true
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

    return { schema: current, nullable }
  }
}