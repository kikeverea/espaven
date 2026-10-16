import * as z from 'zod'
import { config } from '@/features/suppliers/data/supplier.form'
import { extractSchema } from '@/components/Form/util'

const formSchema = extractSchema(config)

describe('supplierFormSchema', () => {

  test('accepts a valid supplier', () => {
    const result = formSchema.safeParse(supplier())
    expect(result.success).toBe(true)
  })

  it.each([
    'name',
    'color',
  ])('rejects if %s not present', field => {
    const result = formSchema.safeParse(supplier({ [field]: null }))
    expect(result.success).toBe(false)
  })

  it.each([ 'name', 'city', 'phone', 'email', 'color' ])('rejects if %s length less than min length, passes if not', field => {
    const invalid = formSchema.safeParse(supplier({ [field]: '1' }))
    const valid = formSchema.safeParse(supplier({ [field]: '11' }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([ [ 'name', 48 ], [ 'city', 48 ], [ 'phone', 48 ], [ 'email', 48 ], [ 'color', 48 ] ])('rejects if %s length more than max length, passes if not', (field, maxLength) => {
    const valid = formSchema.safeParse(supplier({ [field]: '1'.repeat(maxLength) }))
    const invalid = formSchema.safeParse(supplier({ [field]: '1'.repeat(maxLength + 1) }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })
})

const supplier = (customFields: Partial<z.infer<typeof formSchema>> = {}) => {
  return { name: 'Test name', city: 'Test city', phone: 'Test phone', email: 'Test email', color: 'Test color', ...customFields }
}
