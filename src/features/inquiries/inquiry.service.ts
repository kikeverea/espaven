import type { Inquiry, NewInquiry } from '../types.ts'
import { apiFetch } from '@/api/apiClient.ts'

const getInquiries = async (): Promise<Inquiry[]> => {
  return await apiFetch<Inquiry[]>(`/inquiries`)
}

const getInquiry = async (id: Inquiry['id']): Promise<Inquiry> => {
  return await apiFetch<Inquiry>(`/inquiries/${id}`)
}

const createInquiry = async (payload: NewInquiry): Promise<Inquiry> => {
  return await apiFetch<Inquiry>(`/inquiries`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

const updateInquiry = async (inquiry: Inquiry): Promise<Inquiry> => {
  return await apiFetch<Inquiry>(`/inquiries/${inquiry.id}`, {
    method: 'PUT',
    body: JSON.stringify(inquiry),
  })
}

const deleteInquiry = async (inquiry: Inquiry): Promise<Inquiry> => {
  return await apiFetch<Inquiry>(`/inquiries/${inquiry.id}`, { method: 'DELETE' })
}

export default { getInquiries, getInquiry, createInquiry, updateInquiry, deleteInquiry }
