import * as z from 'zod'
import { defineFormConfig } from '@/components/Form/util.ts'
import type { ServiceTemplate } from '@/features/serviceTemplates/types.ts'
import type { InferSchema } from '@/components/Form/types.ts'
import { toCents, toDecimal } from '@/lib/numbers.ts'

const fields = {
  name: {
    label: 'Nombre',
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(148, 'Máximo 148 caracteres'),
  },
  expectedHours: {
    label: 'Horas de trabajo',
    schema: z.coerce.number().min(0, 'No puede ser menor de 0')
  },
  price: {
    label: 'Precio',
    schema: z.coerce.number().min(0, 'No puede ser menor de 0')
  }
}

export const config = defineFormConfig({
  fields,
  toFormData: (template: ServiceTemplate): InferSchema<typeof fields> => {
    const { priceCents, expectedMinutes, ...rest } = template

    return {
      ...rest,
      price: toDecimal(template.priceCents),
      expectedHours: expectedMinutes / 60
    }
  },
  toSubmitData: (template: ServiceTemplate, formData: InferSchema<typeof fields>) => {
    return {
      ...template,
      ...formData,
      priceCents: toCents(formData.price),
      expectedMinutes: formData.expectedHours * 60
    }
  }
})
