'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import type { Inquiry, InquiryComment, NewInquiryComment } from '@/features/types.ts'
import { formSchema, applyData } from '@/features/inquiries/comments/CommentForm/schema.ts'
import { useInquiryCommentsMutations } from '@/features/inquiries/comments/useInquiryComments'
import { toast } from "@/components/ui/toast.tsx"
import FormTextarea from '@/components/Form/FormTextarea.tsx'

type CommentFormProps = {
  inquiry: Inquiry
  comment: NewInquiryComment | InquiryComment | null
  onCancel: () => void
}

const CommentForm = ({ inquiry, comment, onCancel }: CommentFormProps) => {
  const { create, update, status } = useInquiryCommentsMutations(inquiry)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    disabled: status.pending.any
  })

  const handleSubmit = (formData: z.infer<typeof formSchema>) => {
    if (comment === null) return

    const submitInquiryComment = applyData(inquiry, comment, formData)

    const onSuccess = () => {
      toast.add({ title: "Comentario guardado" })
      form.reset()
    }

    if ('id' in submitInquiryComment)
      update(submitInquiryComment, { onSuccess })
    else
      create(submitInquiryComment, { onSuccess })
  }

  const handleCancel = () => {
    form.reset()
    onCancel()
  }

  return (
    <>
      <form id='inquiry-comments-form' onSubmit={form.handleSubmit(handleSubmit)} >
        <FormTextarea form={ form } name='body' placeholder='Nuevo comentario' maxLength={ 500 }/>

        <div className='flex gap-2'>
          <Button type='button' variant='outline' onClick={ handleCancel } disabled={ status.pending.any }>
            Cancelar
          </Button>
          <Button type='submit' form='inquiry-comments-form' disabled={ status.pending.any }>
            Guardar
            { status.pending.any && <Spinner />}
          </Button>
        </div>
      </form>

    </>
  )
}

export default CommentForm