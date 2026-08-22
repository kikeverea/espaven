import api from '@/features/inquiries/comments/data/inquiry.comments.service.ts'
import { useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'
import type { Inquiry, InquiryComment, FormInquiryComment } from '@/features/inquiries/types.ts'

export const useInquiryCommentsMutations = (inquiry: Inquiry) => {
  const commentKeys = {
    all: ['inquiries', inquiry.id, 'comments'] as const,
    create: ['inquiries', inquiry.id, 'comments', 'create'] as const,
    update: ['inquiries', inquiry.id, 'comments', 'update'] as const,
    delete: ['inquiries', inquiry.id, 'comments', 'delete'] as const,
  }

  const inquiriesApi = {
    create: api.createComment,
    update: api.updateComment,
    delete: api.deleteComment,
  }

  return useMutations<InquiryComment, FormInquiryComment>(commentKeys, inquiriesApi)
}

export const useInquiryComments = (inquiry: Inquiry) => {
  const { data: comments, isPending, isError } =
    useQuery({ queryKey: ['inquiries', inquiry.id, 'comments'], queryFn: () => api.getComments(inquiry) })

  return { comments, isPending, isError }
}