import { apiFetch } from '@/api/apiClient.ts'
import type { Inquiry, InquiryComment, NewInquiryComment } from '@/features/types.ts'

const getComments = async (inquiry: Inquiry): Promise<InquiryComment[]> => {
  return await apiFetch<InquiryComment[]>(`/inquiries/${inquiry.id}/comments`)
}

const createComment = async (comment: NewInquiryComment): Promise<InquiryComment> => {
  const { inquiry, ...payload } = comment

  if (!inquiry)
    throw Error('comment must include inquiry')

  return await apiFetch<InquiryComment>(`/inquiries/${inquiry.id}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

const updateComment = async (comment: InquiryComment): Promise<InquiryComment> => {
  const { inquiry, ...payload } = comment

  if (!inquiry)
    throw Error('comment must include inquiry')

  return await apiFetch<InquiryComment>(`/inquiries/${inquiry.id}/comments/${comment.id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

const deleteComment = async (comment: InquiryComment): Promise<InquiryComment> => {
  if (!comment.inquiry)
    throw Error('comment must include inquiry')
  return await apiFetch<InquiryComment>(`/inquiries/${comment.inquiry.id}/comments/${comment.id}`, { method: 'DELETE' })
}

export default { getComments, createComment, updateComment, deleteComment }
