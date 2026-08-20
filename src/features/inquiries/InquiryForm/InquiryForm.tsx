'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import type { Inquiry, NewInquiry } from '@/features/types'
import FormInput from '@/components/Form/FormInput.tsx'
import FormMultiInput from '@/components/Form/FormMultiInput.tsx'
import { formSchema, applyData } from '@/features/inquiries/InquiryForm/schema'
import { useInquiryMutations } from '@/features/inquiries/useInquiries'
import { toast } from "@/components/ui/toast"

type InquiryFormProps = {
  inquiry: NewInquiry | Inquiry | null
  onCancel: () => void
}

const InquiryForm = ({ inquiry, onCancel }: InquiryFormProps) => {
  const { create, update, status } = useInquiryMutations()

  if (status.errors.creating)
    toast.add({ title: status.errors.creating.error?.message, type: 'error' })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', lastName: '' },
    disabled: status.pending.any
  })

  const emails = useFieldArray({ control: form.control, name: 'emails' })
  const phoneNumbers = useFieldArray({ control: form.control, name: 'phoneNumbers' })

  const handleSubmit = (formData: z.infer<typeof formSchema>) => {
    if (inquiry === null) return

    const submitInquiry = applyData(inquiry, formData)

    const onSuccess = () => {
      toast.add({ title: 'Solicitud guardada' })
      form.reset()
    }

    if ('id' in submitInquiry)
      update(submitInquiry, { onSuccess })
    else
      create(submitInquiry, { onSuccess })
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
            { (inquiry && 'id' in inquiry) ? 'Editar' : 'Nueva'} Solicitud
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form id='inquiry-form' onSubmit={form.handleSubmit(handleSubmit)} >
            <FormInput form={ form } name='name' label='Nombre' required />
            <FormInput form={ form } name='lastName' label='Apellidos' />
            <FormMultiInput form={ form } values={ emails } name='emails' label="Emails" addMessage='Añadir email' />
            <FormMultiInput form={ form } values={ phoneNumbers } name='phoneNumbers' label="Telefonos" addMessage='Añadir email' />
            <FormInput form={ form } name='service' label='Servicio solicitado' required />
          </form>
        </CardContent>

        <div className='px-4 flex gap-2'>
          <Button type='button' variant='outline' onClick={ handleCancel } disabled={ status.pending.any }>
            Cancelar
          </Button>
          <Button type='submit' form='inquiry-form' disabled={ status.pending.any }>
            Guardar
            { status.pending.any && <Spinner />}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default InquiryForm