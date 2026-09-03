import * as z from 'zod'
import { config } from '@/features/unitsOfMeasure/data/units.form'
import { extractSchema } from '@/components/Form/util'
const formSchema = extractSchema(config)

describe('inventoryItemFormSchema', () => {

  test('accepts a valid inventoryItem', () => {
    const result = formSchema.safeParse(inventoryItem())
    expect(result.success).toBe(true)
  })

  it.each([
    'name',
    'lastName',
    'service',
  ])('rejects if %s not present', field => {
    const result = formSchema.safeParse(inventoryItem({ [field]: null }))
    expect(result.success).toBe(false)
  })

  it.each([
    'name',
    'lastName',
    'service',
  ])('rejects if %s length less than min length, passes if not', field => {
    const invalid = formSchema.safeParse(inventoryItem({ [field]: '1' }))
    const valid = formSchema.safeParse(inventoryItem({ [field]: '11' }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([
    ['name', 48],
    ['lastName', 48],
    ['service', 250],
  ])('rejects if %s length more than max length, passes if not', (field, maxLength) => {
    const valid = formSchema.safeParse(inventoryItem({ [field]: '1'.repeat(maxLength) }))
    const invalid = formSchema.safeParse(inventoryItem({ [field]: '1'.repeat(maxLength + 1) }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  test('inventoryItem without email but with phone number is valid', () => {
    const result = formSchema.safeParse(inventoryItem({ emails: []}))
    expect(result.success).toBe(true)
  })

  test('inventoryItem without phone numbers but with emails is valid', () => {
    const result = formSchema.safeParse(inventoryItem({ phoneNumbers: []}))
    expect(result.success).toBe(true)
  })
})

const inventoryItem = (customFields: Partial<z.infer<typeof formSchema>> = {}) => {
  return {
    name: 'Name',
    lastName: 'Last Name',
    service: 'Service',
    emails: [{ value: "test@mail.com" }],
    phoneNumbers: [{ value: "555 555 555" }],
    ...customFields
  }
}