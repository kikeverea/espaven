import type { FormInquiryComment, Inquiry, InquiryComment } from '@/features/inquiries/types.ts'
import { api } from '@/api/apiClient.ts'
import commentMapper from '@/features/comments/data/comment.mapper'

const { apiFetch } = api(commentMapper<InquiryComment>('inquiry'))

const getComments = async (inquiry: Inquiry): Promise<InquiryComment[]> => {
  return await apiFetch<InquiryComment[]>(`/inquiries/${inquiry.id}/comments`)
}

const createComment = async (comment: FormInquiryComment): Promise<InquiryComment> => {
  const { inquiry } = comment

  if (!inquiry)
    throw Error('comment must include an inquiry in this call')

  return await apiFetch<InquiryComment>(`/inquiries/${inquiry.id}/comments`, {
    method: 'POST',
    body: comment,
  })
}

const updateComment = async (id: InquiryComment['id'], comment: FormInquiryComment): Promise<InquiryComment> => {
  const { inquiry } = comment

  if (!inquiry)
    throw Error('comment must include inquiry')

  return await apiFetch<InquiryComment>(`/inquiries/${inquiry.id}/comments/${id}`, {
    method: 'PUT',
    body: comment,
  })
}

const deleteComment = async (comment: InquiryComment): Promise<InquiryComment> => {
  if (!comment.inquiry)
    throw Error('comment must include inquiry')
  return await apiFetch<InquiryComment>(`/inquiries/${comment.inquiry.id}/comments/${comment.id}`, { method: 'DELETE' })
}

export default { getComments, createComment, updateComment, deleteComment }
