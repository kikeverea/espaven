import * as z from 'zod'

export const formSchema = z
.object({
  name: z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(48, 'Máximo 48 caracteres'),

  lastName: z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(48, 'Máximo 48 caracteres')
  .optional(),

  service: z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(250, 'Máximo 250 caracteres'),

  emails: z.array(z.object({ value: z.string().email() })),
  phoneNumbers: z.array(z.object({ value: z.string() }))
})
.refine(
  (data) => data.emails.length > 0 || data.phoneNumbers.length > 0,
  {
    message: 'Añade al menos un email o teléfono',
    path: ['emails']
  }
)