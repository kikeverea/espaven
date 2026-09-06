import * as z from 'zod'
import { config } from '@/features/inventoryCategories/data/inventoryCategory.form'
import { extractSchema } from '@/components/Form/util'

const formSchema = extractSchema(config)

describe('inventoryCategoryFormSchema', () => {

  test('accepts a valid inventoryCategory', () => {
    const result = formSchema.safeParse(inventoryCategory())
    expect(result.success).toBe(true)
  })

  it.each([ 'name', ])('rejects if %s not present', field => {
    const result = formSchema.safeParse(inventoryCategory({ [field]: null }))
    expect(result.success).toBe(false)
  })

  it.each([ 'name', ])('rejects if %s length less than min length, passes if not', field => {
    const invalid = formSchema.safeParse(inventoryCategory({ [field]: '1' }))
    const valid = formSchema.safeParse(inventoryCategory({ [field]: '11' }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([ ['name', 48] ])('rejects if %s length more than max length, passes if not', (field, maxLength) => {
    const valid = formSchema.safeParse(inventoryCategory({ [field]: '1'.repeat(maxLength) }))
    const invalid = formSchema.safeParse(inventoryCategory({ [field]: '1'.repeat(maxLength + 1) }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })
})

const inventoryCategory = (customFields: Partial<z.infer<typeof formSchema>> = {}) => {
  return { name: 'Name', ...customFields }
}