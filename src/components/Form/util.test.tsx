import type { TestData } from '@/lib/testUtils.ts'
import * as z from 'zod'
import { defineFormConfig, extractSchema, selectOptions, isValid } from '@/components/Form/util.ts'
import type { FormFields } from '@/components/Form/types.ts'
import type { Entity } from '@/types.ts'
import { expect } from 'vitest'

describe('selectOptions', () => {

  const collection: TestData[] = [
    { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
    { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
    { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' }
  ]

  test('extracts options', () => {
    const { ids, options } = selectOptions(collection)

    expect(ids).toEqual(collection.map(item => String(item.id)))
    options.forEach((option, ind) => {
      expect(option).toEqual({ label: collection[ind].name, value: String(collection[ind].id) })
    })
  })

  test('extracts options with custom name', () => {
    const { ids, options } = selectOptions(collection, item => item.family)

    expect(ids).toEqual(collection.map(item => String(item.id)))
    options.forEach((option, ind) => {
      expect(option).toEqual({ label: collection[ind].family, value: String(collection[ind].id) })
    })
  })
})

describe('defineFormConfig', () => {

  type Animal = { id: number, name: string, age: number, wild: boolean, family: 'Feline' | 'Canine', birth: Date }

  const fields = {
    name: { schema: z.string() },
    age: { schema: z.number() },
    wild: { schema: z.boolean() },
    family: { schema: z.enum([ 'Feline', 'Canine' ]) },
    birth: { schema: z.date().optional() },
    tags: { schema: z.array(z.string()).optional() },
  }

  const emptyAnimal = { name: '', age: '', wild: false, family: undefined, birth: undefined, tags: [] }

  test('generates default values for every field', () => {
    const config = defineFormConfig<Animal, Animal, typeof fields>({ fields })

    expect(config.defaultValues).toEqual(emptyAnimal)
  })

  test('explicit default values take precedence', () => {
    const config = defineFormConfig<Animal, Animal, typeof fields>({
      fields,
      defaultValues: { age: 1, family: 'Feline' }
    })

    expect(config.defaultValues).toEqual({ ...emptyAnimal, age: 1, family: 'Feline' })
  })

  test('fills the values missing from an edited item', () => {
    const config = defineFormConfig<Animal, Animal, typeof fields>({ fields })
    const cat = { id: 1, name: 'Cat', family: 'Feline' } as Animal

    expect(config.toFormData(cat)).toEqual({ ...emptyAnimal, name: 'Cat', family: 'Feline' })
  })

  test('fills the values missing from a custom toFormData', () => {
    const config = defineFormConfig<Animal, Animal, typeof fields>({
      fields,
      toFormData: animal => ({ ...animal, name: animal.name.toUpperCase(), tags: undefined })
    })

    const cat = { id: 1, name: 'Cat', age: 10 } as Animal

    /* Keys the config itself adds (`id` here) are kept as they are */
    expect(config.toFormData(cat)).toEqual({ ...emptyAnimal, id: 1, name: 'CAT', age: 10 })
  })
})

describe('extractSchema', () => {

  const schemaOf = (fields: FormFields) =>
    extractSchema(defineFormConfig<Entity, Entity, typeof fields>({ fields }))

  const required = schemaOf({ price: { schema: z.coerce.number().min(0, 'No puede ser menor de 0') }})
  const optional = schemaOf({ price: { schema: z.coerce.number().min(0).optional() }})

  test('reads the value of a number input', () => {
    /* Inputs hand over strings */
    expect(required.safeParse({ price: '2.5' })).toEqual(expect.objectContaining({ data: { price: 2.5 }}))
    expect(required.safeParse({ price: 0 }).success).toBe(true)
  })

  it.each([ '', null, undefined ])('rejects a required number left blank (%s)', value => {
    const result = required.safeParse({ price: value })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Requerido')
  })

  it.each([ '', null, undefined ])('accepts an optional number left blank (%s)', value => {
    const result = optional.safeParse({ price: value })

    expect(result.success).toBe(true)
    expect(result.data?.price).toBeUndefined()
  })

  test('keeps the null of a nullable number', () => {
    const nullable = schemaOf({ price: { schema: z.coerce.number().nullable() }})
    const result = nullable.safeParse({ price: null })

    expect(result.success).toBe(true)
    expect(result.data?.price).toBeNull()
  })

  test('still applies the field validations', () => {
    const result = required.safeParse({ price: -1 })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('No puede ser menor de 0')
  })
})

describe('isValid', () => {

  const quarters = z.coerce.number().min(0).multipleOf(0.25)

  it.each([
    [ 'the typed value', '1.5' ],
    [ 'the value the form was reset to', 0.25 ],
  ])('accepts %s when its schema does', (_, value) => {
    expect(isValid(value, quarters)).toBe(true)
  })

  it.each([
    [ 'rejected by the schema', '0.3' ],
    [ 'not a number', 'abc' ],
  ])('rejects a value %s', (_, value) => {
    expect(isValid(value, quarters)).toBe(false)
  })
})
