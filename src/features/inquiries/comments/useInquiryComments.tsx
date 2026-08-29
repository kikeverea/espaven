import api from '@/features/inquiries/comments/data/inquiry.comments.service'
import { useMutations } from '@/lib/mutations'
import { useQuery } from '@tanstack/react-query'
import type { Inquiry, InquiryComment, FormInquiryComment } from '@/features/inquiries/types'
import { queryClient } from '@/queryClient'

export const useInquiryCommentMutations = (inquiry: Inquiry) => {
  const commentKeys = {
    all: ['inquiries', inquiry.id, 'comments'] as const,
    create: ['inquiries', inquiry.id, 'comments', 'create'] as const,
    update: ['inquiries', inquiry.id, 'comments', 'update'] as const,
    delete: ['inquiries', inquiry.id, 'comments', 'delete'] as const,
  }

  const commentsApi = {
    create: api.createComment,
    update: api.updateComment,
    delete: api.deleteComment,
  }

  const mutationSideEffects = { create: syncInquiry }

  return useMutations<InquiryComment, FormInquiryComment>(commentKeys, commentsApi, { mutationSideEffects })
}

export const useInquiryComments = (inquiry: Inquiry) => {
  const { data: comments, isPending, isError } =
    useQuery({ queryKey: ['inquiries', inquiry.id, 'comments'], queryFn: () => api.getComments(inquiry) })

  return { comments, isPending, isError }
}

function syncInquiry(comment: InquiryComment) {
  queryClient.setQueryData<Inquiry[]>(['inquiries'], old =>
    old?.map(inquiry =>
      inquiry.id === comment.inquiry.id
        ? comment.inquiry
        : inquiry
    )
  )
}