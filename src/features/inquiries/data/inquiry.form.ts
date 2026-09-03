import * as z from 'zod'
import type { FormInquiry, Inquiry } from '@/features/inquiries/types.ts'
import type { InferSchema } from '@/components/Form/types.ts'
import { defineFormConfig } from '@/components/Form/util.ts'

const fields = {
  name: {
    label: 'Nombre',
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres'),
  },

  lastName: {
    label: 'Apellido',
    schema: z
    .string()
    .max(48, 'Máximo 48 caracteres')
    .refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres')
    .optional()
  },

  service: {
    label: 'Servicio',
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(250, 'Máximo 250 caracteres'),
  },

  emails: { label: 'Emails', schema: z.array(z.object({ value: z.string().email() })) },
  phoneNumbers: { label: 'Teléfonos', schema: z.array(z.object({ value: z.string() })).optional() }
}


export const config = defineFormConfig({
  fields,
  refine: {
    fn: (data: { [x: string]: any }) => data.emails.length > 0 || data.phoneNumbers.length > 0,
    args: { message: 'Añade al menos un email o teléfono', path: ['emails'] }
  },
  toSubmitData: (inquiry: FormInquiry, formData: InferSchema<typeof fields>): FormInquiry => {
    const { emails, phoneNumbers, name, lastName = '', ...rest } = formData

    return {
      ...inquiry,
      ...rest,
      status: inquiry.id != null ? inquiry.status : 'pending',
      contact: {
        ...inquiry.contact,
        name,
        lastName,
        emails: emails.map((email) => ({ address: email.value })),
        phoneNumbers: phoneNumbers?.map(phoneNumber => ({ number: phoneNumber.value })),
      }
    } as FormInquiry
  },
  toFormData: (item: Inquiry): InferSchema<typeof fields> => {
    const { contact, ...inquiry } = item
    const { emails, phoneNumbers, ...contactRest } = contact

    return {
      ...contactRest,
      emails: emails?.map(email => ({ value: email.address })) || [],
      phoneNumbers: phoneNumbers?.map(phoneNumber => ({ value: phoneNumber.number })) || [],
      ...inquiry,
    }
  }
})