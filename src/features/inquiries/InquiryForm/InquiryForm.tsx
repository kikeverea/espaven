'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import type { Inquiry } from '@/features/types.ts'
import FormInput from '@/components/Form/FormInput/FormInput.tsx'
import FormMultiInput from '@/components/Form/MultiInput/FormMultiInput.tsx'
import { formSchema } from '@/features/inquiries/InquiryForm/schema.ts'

type InquiryFormProps = {
  inquiry: Partial<Inquiry> | null
  onCancel: () => void
}

const InquiryForm = ({ inquiry, onCancel }: InquiryFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', lastName: '' }
  })

  const emails = useFieldArray({ control: form.control, name: "emails" })
  const phoneNumbers = useFieldArray({ control: form.control, name: "phoneNumbers" })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    toast('You submitted the following values:', {
      description: (
        <pre className='mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground'>
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: 'bottom-right',
      classNames: {
        content: 'flex flex-col gap-2',
      },
      style: {
        '--border-radius': 'calc(var(--radius)  + 4px)',
      } as React.CSSProperties,
    })
  }

  const handleCancel = () => {
    form.reset()
    onCancel()
  }

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
            { inquiry?.id ? 'Editar' : 'Nueva'} Solicitud
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form id='inquiry-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormInput form={ form } name='name' label='Nombre' required />
            <FormInput form={ form } name='lastName' label='Apellidos' />
            <FormMultiInput form={ form } values={ emails } name='emails' label="Emails" addMessage='Añadir email' />
            <FormMultiInput form={ form } values={ phoneNumbers } name='phoneNumbers' label="Telefonos" addMessage='Añadir email' />
            <FormInput form={ form } name='service' label='Servicio solicitado' required />
          </form>
        </CardContent>

        <div className='px-4 flex gap-2'>
          <Button type='button' variant='outline' onClick={ handleCancel }>
            Cancelar
          </Button>
          <Button type='submit' form='inquiry-form'>
            Guardar
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default InquiryForm