import { config } from '@/features/unitsOfMeasure/data/units.form'
import { extractSchema } from '@/components/Form/util'
import { createFactories } from '@/test/factories.ts'
const formSchema = extractSchema(config)

describe('unitOfMeasureFormSchema', () => {

  const { unitOfMeasure } = createFactories()

  test('accepts a valid unitOfMeasure', () => {
    const result = formSchema.safeParse(unitOfMeasure())
    expect(result.success).toBe(true)
  })

  it.each([
    'name',
  ])('rejects if %s not present', field => {
    const result = formSchema.safeParse(unitOfMeasure({ [field]: null }))
    expect(result.success).toBe(false)
  })

  it.each([
    'name',
  ])('rejects if %s length less than min length, passes if not', field => {
    const invalid = formSchema.safeParse(unitOfMeasure({ [field]: '1' }))
    const valid = formSchema.safeParse(unitOfMeasure({ [field]: '11' }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([
    ['name', 48],
  ])('rejects if %s length more than max length, passes if not', (field, maxLength) => {
    const valid = formSchema.safeParse(unitOfMeasure({ [field]: '1'.repeat(maxLength) }))
    const invalid = formSchema.safeParse(unitOfMeasure({ [field]: '1'.repeat(maxLength + 1) }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })
})