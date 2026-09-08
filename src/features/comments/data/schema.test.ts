import * as z from 'zod'
import { config } from '@/features/comments/data/comment.form.ts'
import { extractSchema } from '@/components/Form/util.ts'

const schema = extractSchema(config)

describe('commentFormSchema', () => {

  test('accepts a valid comment', () => {
    const result = schema.safeParse(comment())
    expect(result.success).toBe(true)
  })

  it.each([ 'body' ])('rejects if %s not present', field => {
    const result = schema.safeParse(comment({ [field]: null }))
    expect(result.success).toBe(false)
  })
})

const comment = (customFields: Partial<z.infer<typeof schema>> = {}) => {
  return { body: 'A body', ...customFields }
}