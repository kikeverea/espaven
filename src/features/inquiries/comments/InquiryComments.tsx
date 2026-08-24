import { CirclePlus } from 'lucide-react'
import { useInquiryComments } from '@/features/inquiries/comments/useInquiryComments.tsx'
import type { Inquiry, InquiryComment, FormInquiryComment } from '@/features/inquiries/types.ts'
import { useState } from 'react'
import CommentForm from '@/features/inquiries/comments/CommentForm.tsx'
import CommentList from '@/features/comments/CommentList.tsx'

type InquiryCommentsProps = {
  inquiry: Inquiry
}

const InquiryComments = ({ inquiry }: InquiryCommentsProps) => {

  const { comments } = useInquiryComments(inquiry)
  const [ formComment, setFormComment ] = useState<FormInquiryComment | InquiryComment | null>(null)

  return (
    <div className='px-4'>
      <div className='flex justify-between items-center'>
        <h2>Comentarios</h2>

        <button
          className='btn btn-flush flex items-center justify-end gap-2 w-fit group cursor-pointer'
          onClick={() => setFormComment({})}
        >
          <span className="
            inline-block text-xs text-blue-700
            origin-right scale-x-0 opacity-0
            transition duration-200 ease-in-out
            group-hover:scale-x-100 group-hover:opacity-100"
          >
            Nuevo comentario
          </span>
          <CirclePlus className='
            text-blue-500
            size-5
            group-hover:-rotate-180
            transition duration-200 ease-in-out'
          />
        </button>
      </div>
      { formComment &&
        <CommentForm inquiry={ inquiry } comment={ formComment } onCancel={() => setFormComment(null)} />
      }
      <CommentList comments={ (comments || []) } showEmptyMessage={ !formComment } />
    </div>
  )
}

export default InquiryComments