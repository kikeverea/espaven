import * as z from 'zod'
import { defineFormConfig, selectOptions } from '@/components/Form/util.ts'
import type { InventoryCategory } from '@/features/inventoryCategories/types.ts'
import type { FormGenericPart, GenericPart } from '@/features/genericParts/types.ts'
import type { InferSchema } from '@/components/Form/types.ts'

export const config = (categories: InventoryCategory[] = []) => {
  const { ids = [], options = [] } = selectOptions(categories)

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
  }

  return defineFormConfig<GenericPart, FormGenericPart>({
    fields,
    toFormData: (genericPart: GenericPart): InferSchema<typeof fields> => {
      const { inventoryCategory, ...rest } = genericPart

      return {
        ...rest,
        inventoryCategoryId: inventoryCategory.id as unknown as string
      }
    }
  })
}