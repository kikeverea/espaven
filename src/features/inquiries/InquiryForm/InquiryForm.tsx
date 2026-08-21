import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Inquiry, NewInquiry } from '@/features/types'
import { useInquiryMutations } from '@/features/inquiries/useInquiries'
import Form, { type FormConfig, type InferFormData } from '@/components/Form/Form.tsx'

type InquiryFormProps = {
  inquiry: NewInquiry | Inquiry | null
  onCancel: () => void
}

export const config = {
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
    phoneNumbers: { label: 'Teléfonos', schema: z.array(z.object({ value: z.string() })) },

  },
  refine: {
    fn: (data: { [x: string]: any }) => data.emails.length > 0 || data.phoneNumbers.length > 0,
    args: { message: 'Añade al menos un email o teléfono', path: ['emails'] }
  }
} satisfies FormConfig

export const applyData = (inquiry: Inquiry | NewInquiry, formData: InferFormData<typeof config.fields>): Inquiry | NewInquiry => {
  const { emails, phoneNumbers, name, lastName = '', ...rest } = formData

  return {
    ...inquiry,
    ...rest,
    status: 'id' in inquiry ? inquiry.status : 'pending',
    contact: {
      ...(inquiry.contact),
      name,
      lastName,
      emails: emails.map(email => email.value),
      phoneNumbers: phoneNumbers.map(phoneNumber => phoneNumber.value),
    }
  }
}

const InquiryForm = ({ inquiry, onCancel }: InquiryFormProps) => {
  return (
    <div className={
      `grid justify-items-center
      transition-[grid-template-rows] duration-300
      ${inquiry ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`
    }>
      <Card className={`my-4 w-full xl:w-1/2 pt-0 min-h-0 transition-[padding,box-shadow] duration-300
        ${inquiry ? '' : 'py-0 ring-0'}`}>
        <CardHeader className='bg-primary/85 py-2 text-white'>
          <CardTitle className='text-center text-2xl font-semibold'>
            { (inquiry && 'id' in inquiry) ? 'Editar' : 'Nueva'} Solicitud
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form
            name='inquiry'
            config={ config }
            item={inquiry || {} as NewInquiry}
            mutations={useInquiryMutations()}
            applyData={applyData}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default InquiryForm