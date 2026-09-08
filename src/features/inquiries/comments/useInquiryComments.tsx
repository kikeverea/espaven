import api from '@/features/inquiries/comments/data/inquiryComment.api'
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
  const { data, isPending, isError } =
    useQuery({ queryKey: ['inquiries', inquiry.id, 'comments'], queryFn: () => api.getComments(inquiry) })

  return { comments: data?.collection, isPending, isError }
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