import * as z from 'zod'
import { config } from '@/features/genericParts/data/genericPart.form'
import { extractSchema } from '@/components/Form/util'
import { createFactories } from '@/test/factories.ts'

const { inventoryCategory } = createFactories()

const categories = [inventoryCategory(), inventoryCategory()]
const formSchema = extractSchema(config(categories))

describe('genericPartFormSchema', () => {

  test('accepts a valid genericPart', () => {
    const result = formSchema.safeParse(genericPart())
    expect(result.success).toBe(true)
  })

  it.each([
    'name',
    'inventoryCategoryId',
  ])('rejects if %s not present', field => {
    const result = formSchema.safeParse(genericPart({ [field]: null }))
    expect(result.success).toBe(false)
  })

  it.each([ 'name', ])('rejects if %s length less than min length, passes if not', field => {
    const invalid = formSchema.safeParse(genericPart({ [field]: '1' }))
    const valid = formSchema.safeParse(genericPart({ [field]: '11' }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([ ['name', 48] ])('rejects if %s length more than max length, passes if not', (field, maxLength) => {
    const valid = formSchema.safeParse(genericPart({ [field]: '1'.repeat(maxLength) }))
    const invalid = formSchema.safeParse(genericPart({ [field]: '1'.repeat(maxLength + 1) }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })
})

const genericPart = (customFields: Partial<z.infer<typeof formSchema>> = {}) => {
  return { name: 'Name', inventoryCategoryId: String(categories[0].id), ...customFields }
}