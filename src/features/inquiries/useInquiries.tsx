import { type Inquiry, type FormInquiry } from './types.ts'
import api from '@/features/inquiries/data/inquiry.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const inquiryKeys = resourceKeys('inquiries')

export const useInquiryMutations = () =>
  useMutations<Inquiry, FormInquiry>(inquiryKeys, api, { batchDelete: true })

export const useInquiries = (target: 'active' | 'discarded') =>
  useQuery({
    queryKey: inquiryKeys.all,
    queryFn: () => api.getAll(),
    select: data => ({
      ...data,
      collection: data.collection.filter(inquiry =>
        target === 'active'
          ? !inquiry.discardedAt
          : !!inquiry.discardedAt
      ),
    }),
  })
