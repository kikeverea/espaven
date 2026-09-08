import { config } from '@/features/serviceTemplates/data/serviceTemplate.form.ts'
import { extractSchema } from '@/components/Form/util'
import type { ServiceTemplate } from '@/features/serviceTemplates/types.ts'

const formSchema = extractSchema(config)

describe('serviceTemplateFormSchema', () => {

  test('accepts a valid service template', () => {
    const result = formSchema.safeParse(serviceTemplate())
    expect(result.success).toBe(true)
  })

  it.each([
    'name',
  ])('rejects if %s not present', field => {
    const result = formSchema.safeParse(serviceTemplate({ [field]: null }))
    expect(result.success).toBe(false)
  })

  it.each([
    'name',
  ])('rejects if %s length less than min length, passes if not', field => {
    const invalid = formSchema.safeParse(serviceTemplate({ [field]: '1' }))
    const valid = formSchema.safeParse(serviceTemplate({ [field]: '11' }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([
    ['name', 148],
  ])('rejects if %s length more than max length, passes if not', (field, maxLength) => {
    const valid = formSchema.safeParse(serviceTemplate({ [field]: '1'.repeat(maxLength) }))
    const invalid = formSchema.safeParse(serviceTemplate({ [field]: '1'.repeat(maxLength + 1) }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([
    ['price', 0],
    ['expectedHours', 0],
  ])('rejects if %s is less than minimum', (field, min) => {
    const valid = formSchema.safeParse(serviceTemplate({ [field]: min }))
    const invalid = formSchema.safeParse(serviceTemplate({ [field]: min - 1 }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })
})

const serviceTemplate = (args: Partial<ServiceTemplate> = {}) => ({
  name: 'Template 1',
  expectedHours: 1,
  price: 2,
  ...args
})