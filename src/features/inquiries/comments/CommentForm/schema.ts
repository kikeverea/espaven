import * as z from 'zod'
import type { InquiryComment, Inquiry, NewInquiryComment } from '@/features/types.ts'

export const formSchema = z
.object({
  body: z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(500, 'Máximo 500 caracteres'),
})

export const applyData = (
  inquiry: Inquiry,
  comment: NewInquiryComment | InquiryComment,
  formData: z.infer<typeof formSchema>
): InquiryComment | NewInquiryComment => {

  return { inquiry, ...comment, ...formData }
}