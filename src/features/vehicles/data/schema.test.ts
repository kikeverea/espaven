import * as z from 'zod'
import { config } from '@/features/vehicles/data/vehicle.form'
import { extractSchema } from '@/components/Form/util'

const formSchema = extractSchema(config)

describe('vehicleFormSchema', () => {

  test('accepts a valid vehicle', () => {
    const result = formSchema.safeParse(vehicle())
    expect(result.success).toBe(true)
  })

  it.each([
    'clientId',
  ])('rejects if %s not present', field => {
    const result = formSchema.safeParse(vehicle({ [field]: null }))
    expect(result.success).toBe(false)
  })

  it.each([ 'plateNumber', 'description', 'make', 'makeDescription', 'model', 'modelDescription', 'engineSize', 'variation', 'variantType', 'vehicleType', 'fuel', 'kType', 'stolen' ])('rejects if %s length less than min length, passes if not', field => {
    const invalid = formSchema.safeParse(vehicle({ [field]: '1' }))
    const valid = formSchema.safeParse(vehicle({ [field]: '11' }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([ [ 'plateNumber', 48 ], [ 'description', 500 ], [ 'make', 48 ], [ 'makeDescription', 500 ], [ 'model', 48 ], [ 'modelDescription', 500 ], [ 'engineSize', 48 ], [ 'variation', 48 ], [ 'variantType', 48 ], [ 'vehicleType', 48 ], [ 'fuel', 48 ], [ 'kType', 48 ], [ 'stolen', 48 ] ])('rejects if %s length more than max length, passes if not', (field, maxLength) => {
    const valid = formSchema.safeParse(vehicle({ [field]: '1'.repeat(maxLength) }))
    const invalid = formSchema.safeParse(vehicle({ [field]: '1'.repeat(maxLength + 1) }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([ [ 'clientId', 0 ], [ 'seats', 0 ], [ 'doors', 0 ], [ 'dynamicPower', 0 ], [ 'indicativePrice', 0 ] ])('rejects if %s is less than minimum, passes if not', (field, min) => {
    const valid = formSchema.safeParse(vehicle({ [field]: min }))
    const invalid = formSchema.safeParse(vehicle({ [field]: min - 1 }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })
})

const vehicle = (customFields: Partial<z.infer<typeof formSchema>> = {}) => {
  return { clientId: 1, plateNumber: 'Test plateNumber', description: 'Test description', make: 'Test make', makeDescription: 'Test makeDescription', model: 'Test model', modelDescription: 'Test modelDescription', engineSize: 'Test engineSize', registrationDate: new Date(), variation: 'Test variation', variantType: 'Test variantType', vehicleType: 'Test vehicleType', seats: 1, fuel: 'Test fuel', doors: 1, dynamicPower: 1, kType: 'Test kType', indicativePrice: 1, allTerrain: false, stolen: 'Test stolen', ...customFields }
}
