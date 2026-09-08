import type { Inquiry, InquiryComment, FormInquiryComment } from '@/features/inquiries/types.ts'
import { useInquiryCommentMutations } from '@/features/inquiries/comments/useInquiryComments.tsx'
import Form from '@/components/Form/Form.tsx'
import { useMemo } from 'react'
import { config } from '@/features/comments/data/comment.form.ts'

type CommentFormProps = {
  inquiry: Inquiry
  comment: FormInquiryComment | InquiryComment | null
  onCancel: () => void
}

const CommentForm = ({ inquiry, comment, onCancel }: CommentFormProps) => {

  /* Kept stable: a new object on every render would reset the form while it is being typed into */
  const item = useMemo(() => ({ ...comment, inquiry }), [ comment, inquiry ])

  return (
    <Form
      name='inquiry-comment'
      itemName='comentario'
      config={ config }
      item={ item }
      mutations={useInquiryCommentMutations(inquiry)}
      onCancel={onCancel}
    />
  )
}

export default CommentForm