import * as z from 'zod'
import { config } from '@/features/inquiries/data/inquiry.form.ts'
import { extractSchema } from '@/components/Form/Form.tsx'
const formSchema = extractSchema(config)

describe('inquiryFormSchema', () => {

  test('accepts a valid inquiry', () => {
    const result = formSchema.safeParse(inquiry())
    expect(result.success).toBe(true)
  })

  it.each([
    'name',
    'lastName',
    'service',
  ])('rejects if %s not present', field => {
    const result = formSchema.safeParse(inquiry({ [field]: null }))
    expect(result.success).toBe(false)
  })

  it.each([
    'name',
    'lastName',
    'service',
  ])('rejects if %s length less than min length, passes if not', field => {
    const invalid = formSchema.safeParse(inquiry({ [field]: '1' }))
    const valid = formSchema.safeParse(inquiry({ [field]: '11' }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([
    ['name', 48],
    ['lastName', 48],
    ['service', 250],
  ])('rejects if %s length more than max length, passes if not', (field, maxLength) => {
    const valid = formSchema.safeParse(inquiry({ [field]: '1'.repeat(maxLength) }))
    const invalid = formSchema.safeParse(inquiry({ [field]: '1'.repeat(maxLength + 1) }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  test('inquiry without email but with phone number is valid', () => {
    const result = formSchema.safeParse(inquiry({ emails: []}))
    expect(result.success).toBe(true)
  })

  test('inquiry without phone numbers but with emails is valid', () => {
    const result = formSchema.safeParse(inquiry({ phoneNumbers: []}))
    expect(result.success).toBe(true)
  })
})

const inquiry = (customFields: Partial<z.infer<typeof formSchema>> = {}) => {
  return {
    name: 'Name',
    lastName: 'Last Name',
    service: 'Service',
    emails: [{ value: "test@mail.com" }],
    phoneNumbers: [{ value: "555 555 555" }],
    ...customFields
  }
}