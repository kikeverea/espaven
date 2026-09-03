import * as z from 'zod'
import { defineFormConfig } from '@/components/Form/util'
import type { UnitOfMeasure } from '@/features/unitsOfMeasure/types'
import type { Entity } from '@/types.ts'
import type { InventoryItem } from '@/features/inventory/types.ts'
import type { InferSchema } from '@/components/Form/types.ts'
import { toCents, toDecimal } from '@/lib/numbers.ts'

export const config = (unitsOfMeasure: UnitOfMeasure[]) => {

  const { unitIds, units } = unitOfMeasureOptions(unitsOfMeasure)

  const fields = {
    name: {
      label: 'Nombre',
      schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres'),
      step: "0.01"
    },

    unitOfMeasureId: {
      label: 'Unidad de medida',
      schema: z.enum(unitIds.length ? unitIds as [string, ...string[]] : ['sin valores']).optional(),
      options: units
    },

    price: {
      label: 'Precio',
      schema: z.coerce.number().min(0, 'No puede ser menor de 0').optional()
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
      const { unitOfMeasure, priceCents, ...rest } = item

      return {
        ...rest,
        price: toDecimal(item.priceCents),
        unitOfMeasureId: String(unitOfMeasure.id)
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
