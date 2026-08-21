import * as z from 'zod'
import { config } from '@/features/inquiries/comments/CommentForm/CommentForm'
import { extractSchema } from '@/components/Form/Form.tsx'
const schema = extractSchema(config)

describe('inquiryCommentFormSchema', () => {

  test('accepts a valid inquiry', () => {
    const result = schema.safeParse(inquiryComment())
    expect(result.success).toBe(true)
  })

  it.each([ 'body' ])('rejects if %s not present', field => {
    const result = schema.safeParse(inquiryComment({ [field]: null }))
    expect(result.success).toBe(false)
  })
})

const inquiryComment = (customFields: Partial<z.infer<typeof schema>> = {}) => {
  return { body: 'A body', ...customFields }
}