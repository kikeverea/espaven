import { type NewInquiry, type Inquiry } from '../types'
import api from './inquiry.service'
import { useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const inquiryKeys = {
  all: ['inquiries'] as const,
  create: ['inquiries', 'create'] as const,
  update: ['inquiries', 'update'] as const,
  delete: ['inquiries', 'delete'] as const,
}

const inquiriesApi = {
  create: api.createInquiry,
  update: api.updateInquiry,
  delete: api.deleteInquiry,
}

export const useInquiryMutations = () => {
  return useMutations<Inquiry, NewInquiry>(inquiryKeys, inquiriesApi)
}

export const useInquiries = () => {
  const { data: inquiries, isPending, isError } = useQuery({ queryKey: inquiryKeys.all, queryFn: api.getInquiries })
  return { inquiries, isPending, isError }
}