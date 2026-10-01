import * as z from 'zod'
import { config } from '@/features/workOrders/data/workOrder.form'
import { extractSchema } from '@/components/Form/util'

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
    'technicianId',
    'vehicleId',
    'totalMinutes',
  ])('rejects if %s not present', field => {
    const result = formSchema.safeParse(workOrder({ [field]: null }))
    expect(result.success).toBe(false)
  })

  it.each([ 'number', 'stage', 'status' ])('rejects if %s length less than min length, passes if not', field => {
    const invalid = formSchema.safeParse(workOrder({ [field]: '1' }))
    const valid = formSchema.safeParse(workOrder({ [field]: '11' }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([ [ 'number', 48 ], [ 'stage', 48 ], [ 'status', 48 ] ])('rejects if %s length more than max length, passes if not', (field, maxLength) => {
    const valid = formSchema.safeParse(workOrder({ [field]: '1'.repeat(maxLength) }))
    const invalid = formSchema.safeParse(workOrder({ [field]: '1'.repeat(maxLength + 1) }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([ [ 'technicianId', 0 ], [ 'vehicleId', 0 ], [ 'totalMinutes', 0 ] ])('rejects if %s is less than minimum, passes if not', (field, min) => {
    const valid = formSchema.safeParse(workOrder({ [field]: min }))
    const invalid = formSchema.safeParse(workOrder({ [field]: min - 1 }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })
})

const workOrder = (customFields: Partial<z.infer<typeof formSchema>> = {}) => {
  return { number: 'Test number', stage: 'Test stage', status: 'Test status', technicianId: 1, vehicleId: 1, totalMinutes: 1, ...customFields }
}
