import * as z from 'zod'
import { defineFormConfig } from '@/components/Form/util.ts'

const fields = {
  name: {
    label: 'Nombre',
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres'),
  },
  appliesSigaus: {
    label: 'Aplica SIGAUS',
    schema: z.boolean().optional()
  },
}

export const config = defineFormConfig({ fields, defaultValues: { appliesSigaus: false }})