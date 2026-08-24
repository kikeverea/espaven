import * as z from 'zod'
import type { FormInquiry } from '@/features/inquiries/types.ts'
import type { InferSchema } from '@/components/Form/types.ts'
import { defineFormConfig } from '@/components/Form/util.ts'

export const config = defineFormConfig({
  fields: {
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
    phoneNumbers: { label: 'Teléfonos', schema: z.array(z.object({ value: z.string() })).optional() },
  },
  defaultValues: {
    emails: [],
    phoneNumbers: []
  },
  refine: {
    fn: (data: { [x: string]: any }) => data.emails.length > 0 || data.phoneNumbers.length > 0,
    args: { message: 'Añade al menos un email o teléfono', path: ['emails'] }
  }
})

export const applyData = (
  inquiry: FormInquiry,
  formData: InferSchema<typeof config.fields>
): FormInquiry => {

  const { emails, phoneNumbers, name, lastName = '', ...rest } = formData

  return {
    ...inquiry,
    ...rest,
    status: 'id' in inquiry ? inquiry.status : 'pending',
    contact: {
      ...(inquiry.contact),
      name,
      lastName,
      emails: emails.map((email) => email.value),
      phoneNumbers: phoneNumbers?.map(phoneNumber => phoneNumber.value),
    }
  }
}
