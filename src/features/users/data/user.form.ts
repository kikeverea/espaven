import * as z from 'zod'
import { defineFormConfig } from '@/components/Form/util.ts'
import type { FormUser, User } from '@/features/users/types.ts'

const fields = {
  fullName: {
    label: 'Nombre',
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres'),
  },
  role: {
    label: 'Rol',
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres'),
  },
  email: {
    label: 'Email',
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres'),
  },
}

export const config = defineFormConfig<User, FormUser, typeof fields>({
  fields,
})
