import type { FormInquiry, Inquiry } from '../types.ts'
import { api } from '@/api/apiClient.ts'
import { mapperFactory } from './inquiry.mapper.ts'

const { apiFetch, fetch } = api(mapperFactory())

const getInquiries = async (): Promise<Inquiry[]> => {
  return await apiFetch<Inquiry[]>(`/inquiries`)
}

const getInquiry = async (id: Inquiry['id']): Promise<Inquiry> => {
  return await apiFetch<Inquiry>(`/inquiries/${id}`)
}

const createInquiry = async (payload: FormInquiry): Promise<Inquiry> => {
  return await apiFetch<Inquiry>(`/inquiries`, {
    method: 'POST',
    body: payload
  })
}

const updateInquiry = async (id: Inquiry['id'], inquiry: FormInquiry): Promise<Inquiry> => {
  return await apiFetch<Inquiry>(`/inquiries/${id}`, {
    method: 'PUT',
    body: inquiry,
  })
}

const deleteInquiry = async (inquiry: Inquiry): Promise<Inquiry> => {
  return await apiFetch<Inquiry>(`/inquiries/${inquiry.id}`, { method: 'DELETE' })
}

const deleteInquiries = async (ids: Inquiry['id'][]): Promise<boolean[]> => {
  return await fetch<boolean[]>(`/inquiries/batch_destroy`, {
    method: 'POST',
    body: { ids: ids }
  })
}

export default { getInquiries, getInquiry, createInquiry, updateInquiry, deleteInquiry, deleteInquiries }
