import type { Inquiry, InquiryComment, FormInquiryComment } from '@/features/inquiries/types.ts'
import { useInquiryCommentMutations } from '@/features/inquiries/comments/useInquiryComments.tsx'
import Form from '@/components/Form/Form.tsx'
import { applyData, config } from '@/features/comments/data/comment.form.ts'

type CommentFormProps = {
  inquiry: Inquiry
  comment: FormInquiryComment | InquiryComment | null
  onCancel: () => void
}

const CommentForm = ({ inquiry, comment, onCancel }: CommentFormProps) => {

  return (
    <Form
      name='inquiry-comment'
      itemName='comentario'
      config={ config }
      item={{ ...comment, inquiry }}
      mutations={useInquiryCommentMutations(inquiry)}
      applyData={applyData}
      onCancel={onCancel}
    />
  )
}

export default CommentForm