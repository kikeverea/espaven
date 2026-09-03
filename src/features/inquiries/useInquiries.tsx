import { type Inquiry, type FormInquiry } from './types.ts'
import api from '@/features/inquiries/data/inquiry.service.ts'
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
  deleteAll: api.deleteInquiries
}

export const useInquiryMutations = () => {
  return useMutations<Inquiry, FormInquiry>(inquiryKeys, inquiriesApi, { batchDelete: true })
}

export const useInquiries = (target: 'active' | 'discarded') => {
  return useQuery({
    queryKey: inquiryKeys.all,
    queryFn: api.getInquiries,
    select: data =>
      data.filter(inquiry =>
        target === 'active'
          ? !inquiry.discardedAt
          : !!inquiry.discardedAt
      ),
  })
}