import * as z from 'zod'
import type { FormInquiryComment, InquiryComment } from '@/features/inquiries/types.ts'
import type { InferSchema } from '@/components/Form/types.ts'

export const config = {
  fields: {
    body: {
      schema: z.string().min(2, 'Mínimo 2 caracteres').max(500, 'Máximo 500 caracteres'),
    }
  }
}

export const applyData = (
  comment: FormInquiryComment | InquiryComment,
  formData: InferSchema<typeof config.fields>
): InquiryComment | FormInquiryComment => {

  return { inquiry: comment.inquiry, ...comment, ...formData }
}