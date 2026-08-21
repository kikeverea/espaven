import * as z from 'zod'

import type { Inquiry, InquiryComment, NewInquiryComment } from '@/features/types.ts'
import { useInquiryCommentsMutations } from '@/features/inquiries/comments/useInquiryComments'
import Form, { type InferSchema } from '@/components/Form/Form.tsx'

type CommentFormProps = {
  inquiry: Inquiry
  comment: NewInquiryComment | InquiryComment | null
  onCancel: () => void
}

export const config = {
  fields: {
    body: {
      schema: z.string().min(2, 'Mínimo 2 caracteres').max(500, 'Máximo 500 caracteres'),
    }
  }
}

export const applyData = (
  comment: NewInquiryComment | InquiryComment,
  formData: InferSchema<typeof config.fields>
): InquiryComment | NewInquiryComment => {

  return { inquiry: comment.inquiry, ...comment, ...formData }
}

const CommentForm = ({ inquiry, comment, onCancel }: CommentFormProps) => {

  return (
    <Form
      name='inquiry-comment'
      config={ config }
      item={{ ...comment, inquiry }}
      mutations={useInquiryCommentsMutations(inquiry)}
      applyData={applyData}
      onCancel={onCancel}
    />
  )
}

export default CommentForm