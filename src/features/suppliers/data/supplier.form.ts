import * as z from 'zod'
import { defineFormConfig } from '@/components/Form/util.ts'
import type { FormSupplier, Supplier } from '@/features/suppliers/types.ts'

const fields = {
  name: {
    label: 'Nombre',
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres'),
  },
  city: {
    label: 'Ciudad',
    schema: z.string().max(48, 'Máximo 48 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
  },
  phone: {
    label: 'Teléfono',
    schema: z.string().max(48, 'Máximo 48 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
  },
  email: {
    label: 'Email',
    schema: z.string().max(48, 'Máximo 48 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
  },
  color: {
    label: 'Color',
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres'),
  },
}

export const config = defineFormConfig<Supplier, FormSupplier, typeof fields>({
  fields,
})
