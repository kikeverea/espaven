import * as z from 'zod'
import type { Inquiry, NewInquiry } from '@/features/types.ts'

export const formSchema = z
.object({
  name: z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(48, 'Máximo 48 caracteres'),

  lastName: z
  .string()
  .max(48, 'Máximo 48 caracteres')
  .refine(
    value => value === '' || value.length >= 2,
    'Mínimo 2 caracteres'
  )
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

export const applyData = (inquiry: NewInquiry | Inquiry, formData: z.infer<typeof formSchema>): NewInquiry | Inquiry => {
  const { emails, phoneNumbers, name, lastName = '', ...rest } = formData

  return {
    ...inquiry,
    ...rest,
    status: 'id' in inquiry ? inquiry.status : 'pending',
    contact: {
      ...(inquiry.contact || {}),
      name,
      lastName,
      emails: emails.map(email => email.value),
      phoneNumbers: phoneNumbers.map(phoneNumber => phoneNumber.value),
    }
  }
}