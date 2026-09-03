import * as z from 'zod'
import { defineFormConfig } from '@/components/Form/util'

type UOMUniqFields = 'name'

export const defineForm = (uniqIndex: Record<UOMUniqFields, string[]>) => defineFormConfig({
  fields: {
    name: {
      label: 'Nombre',
      schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres')
      .refine(
        name => !uniqIndex.name.includes(name),
        'Ya existe una unidad con ese nombre'
      ),
    },
  },
})
