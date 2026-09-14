import { config } from '@/features/inventory/inventoryItems/data/inventoryItem.form'
import { extractSchema } from '@/components/Form/util'
import { createFactories } from '@/test/factories'
import type { InventoryItem } from '@/features/inventory/inventoryItems/types'

const { unitOfMeasure } = createFactories()

const unitsOfMeasure = [
  unitOfMeasure({ name: 'ml'}),
  unitOfMeasure({ name: 'unit'}),
]

const formSchema = extractSchema(config(unitsOfMeasure))

describe('inventoryItemFormSchema', () => {

  test('accepts a valid inventoryItem', () => {
    const result = formSchema.safeParse(inventoryItem())
    expect(result.success).toBe(true)
  })

  it.each([
    'name',
    'unitOfMeasureId',
    'price',
  ])('rejects if %s not present', field => {
    const result = formSchema.safeParse(inventoryItem({ [field]: null }))

    console.log('RESULT', result.error)

    expect(result.success).toBe(false)
  })

  it.each([
    'name',
  ])('rejects if %s length less than min length', field => {
    const invalid = formSchema.safeParse(inventoryItem({ [field]: '1' }))
    const valid = formSchema.safeParse(inventoryItem({ [field]: '11' }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([
    ['name', 48],
  ])('rejects if %s length more than max length', (field, maxLength) => {
    const valid = formSchema.safeParse(inventoryItem({ [field]: '1'.repeat(maxLength) }))
    const invalid = formSchema.safeParse(inventoryItem({ [field]: '1'.repeat(maxLength + 1) }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([
    ['price', 0],
    ['stock', 0],
  ])('rejects if %s is less than minimum', (field, min) => {
    const valid = formSchema.safeParse(inventoryItem({ [field]: min }))
    const invalid = formSchema.safeParse(inventoryItem({ [field]: min - 1 }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })
})

const inventoryItem = (args: Partial<InventoryItem> = {}) => ({
  name: 'Test item 1',
  stock: 15,
  sku: 'SKUT',
  unitOfMeasureId: '1',
  price: 2,
  ...args
})