import * as z from 'zod'
import { config } from '@/features/workOrders/data/workOrder.form'
import { extractSchema } from '@/components/Form/util'
import { stageLabels, statusLabels } from '@/features/workOrders/status'

const formSchema = extractSchema(config)

describe('workOrderFormSchema', () => {

  test('accepts a valid workOrder', () => {
    const result = formSchema.safeParse(workOrder())
    expect(result.success).toBe(true)
  })

  it.each([
    'number',
    'stage',
    'status',
    'vehicleId',
    'labourMinutes',
  ])('rejects if %s not present', field => {
    const result = formSchema.safeParse(workOrder({ [field]: null }))
    expect(result.success).toBe(false)
  })

  it.each([ 'number' ])('rejects if %s length less than min length, passes if not', field => {
    const invalid = formSchema.safeParse(workOrder({ [field]: '1' }))
    const valid = formSchema.safeParse(workOrder({ [field]: '11' }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([ [ 'number', 48 ] ])('rejects if %s length more than max length, passes if not', (field, maxLength) => {
    const valid = formSchema.safeParse(workOrder({ [field]: '1'.repeat(maxLength) }))
    const invalid = formSchema.safeParse(workOrder({ [field]: '1'.repeat(maxLength + 1) }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([
    [ 'stage', Object.keys(stageLabels) ],
    [ 'status', Object.keys(statusLabels) ],
  ])('accepts every %s there is, and nothing else', (field, values) => {
    values.forEach(value =>
      expect(formSchema.safeParse(workOrder({ [field]: value })).success).toBe(true))

    expect(formSchema.safeParse(workOrder({ [field]: 'Test value' })).success).toBe(false)
  })

  test('takes no technicians, or as many as there are', () => {
    expect(formSchema.safeParse(workOrder({ technicianIds: [] })).success).toBe(true)
    expect(formSchema.safeParse(workOrder({ technicianIds: [ { value: 1 }, { value: 2 } ] })).success).toBe(true)
    expect(formSchema.safeParse(workOrder({ technicianIds: [ { value: -1 } ] })).success).toBe(false)
  })

  it.each([ [ 'vehicleId', 0 ], [ 'labourMinutes', 0 ] ])('rejects if %s is less than minimum, passes if not', (field, min) => {
    const valid = formSchema.safeParse(workOrder({ [field]: min }))
    const invalid = formSchema.safeParse(workOrder({ [field]: min - 1 }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })
})

const workOrder = (customFields: Partial<z.infer<typeof formSchema>> = {}) => {
  return { number: 'Test number', stage: 'order', status: 'notStarted', technicianIds: [ { value: 1 } ], vehicleId: 1, labourMinutes: 1, ...customFields }
}
