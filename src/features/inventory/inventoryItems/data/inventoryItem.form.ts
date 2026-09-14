import * as z from 'zod'
import { defineFormConfig, selectOptions } from '@/components/Form/util'
import type { UnitOfMeasure } from '@/features/unitsOfMeasure/types'
import type { Entity } from '@/types.ts'
import type { InventoryItem } from '@/features/inventory/inventoryItems/types'
import type { InferSchema } from '@/components/Form/types'
import { toCents, toDecimal } from '@/lib/numbers'
import type { InventoryCategory } from '@/features/inventoryCategories/types.ts'

export const config = (categories: InventoryCategory[], unitsOfMeasure: UnitOfMeasure[]) => {

  const { ids = [], options = [] } = selectOptions(categories)

  const { unitIds, units } = unitOfMeasureOptions(unitsOfMeasure)

  const fields = {
    name: {
      label: 'Nombre',
      schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres'),
    },

    inventoryCategoryId: {
      label: 'Categoría',
      schema: z.enum(ids.length ? ids as [string, ...string[]] : ['sin valores']),
      options: options
    },

    unitOfMeasureId: {
      label: 'Unidad de medida',
      schema: z.enum(unitIds.length ? unitIds as [string, ...string[]] : ['sin valores']),
      options: units
    },

    price: {
      schema: z.coerce.number().min(0, 'No puede ser menor de 0'),
      label: 'Precio',
      step: '0.01'
    },

    stock: {
      label: 'Stock',
      schema: z.coerce.number().min(0, 'No puede ser menor de 0').optional()
    },
  }


  return defineFormConfig({
    fields,
    defaultValues: { stock: 0 },
    toFormData: (item: InventoryItem): InferSchema<typeof fields> => {
      const { unitOfMeasure, priceCents, inventoryCategory, ...rest } = item

      return {
        ...rest,
        price: toDecimal(item.priceCents),
        unitOfMeasureId: String(unitOfMeasure.id),
        inventoryCategoryId: String(inventoryCategory.id)
      }
    },
    toSubmitData: (item: InventoryItem, formData: InferSchema<typeof fields>) => {
      return {
        ...item,
        ...formData,
        priceCents: toCents(formData.price),
      }
    }
  })
}


function unitOfMeasureOptions(unitOfMeasure: UnitOfMeasure[]) {
  return unitOfMeasure.reduce((result, unit) => {
      const id = String(unit.id)

      result.units.push({ label: unit.name, value: id })
      result.unitIds.push(id)

      return result
    },
    { unitIds: [], units: [] } as
      { unitIds: string[], units: { label: string, value: string | Entity['id'] }[] })
}
