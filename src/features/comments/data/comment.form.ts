import * as z from 'zod'
import { defineFormConfig } from '@/components/Form/util.ts'
import type { FormInquiryComment, InquiryComment } from '@/features/inquiries/types.ts'

const fields = {
  body: {
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(500, 'Máximo 500 caracteres'),
  }
}

export const config = defineFormConfig<InquiryComment, FormInquiryComment, typeof fields>({ fields })
