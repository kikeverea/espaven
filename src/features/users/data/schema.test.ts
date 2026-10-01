import * as z from 'zod'
import { config } from '@/features/users/data/user.form'
import { extractSchema } from '@/components/Form/util'

const formSchema = extractSchema(config)

describe('userFormSchema', () => {

  test('accepts a valid user', () => {
    const result = formSchema.safeParse(user())
    expect(result.success).toBe(true)
  })

  it.each([
    'fullName',
    'role',
    'email',
  ])('rejects if %s not present', field => {
    const result = formSchema.safeParse(user({ [field]: null }))
    expect(result.success).toBe(false)
  })

  it.each([ 'fullName', 'role', 'email' ])('rejects if %s length less than min length, passes if not', field => {
    const invalid = formSchema.safeParse(user({ [field]: '1' }))
    const valid = formSchema.safeParse(user({ [field]: '11' }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([ [ 'fullName', 48 ], [ 'role', 48 ], [ 'email', 48 ] ])('rejects if %s length more than max length, passes if not', (field, maxLength) => {
    const valid = formSchema.safeParse(user({ [field]: '1'.repeat(maxLength) }))
    const invalid = formSchema.safeParse(user({ [field]: '1'.repeat(maxLength + 1) }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })
})

const user = (customFields: Partial<z.infer<typeof formSchema>> = {}) => {
  return { fullName: 'Test fullName', role: 'Test role', email: 'Test email', ...customFields }
}
