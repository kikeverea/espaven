import { type Inquiry, type FormInquiry } from './types.ts'
import api from '@/features/inquiries/data/inquiry.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const inquiryKeys = resourceKeys('inquiries')

export const useInquiryMutations = () =>
  useMutations<Inquiry, FormInquiry>(inquiryKeys, api, { batchDelete: true })

/*
 * Whether any active inquiry is new: no one has done anything with it yet. Checked every minute, and
 * whenever an inquiry changes
 */
export const useHasNewInquiries = () =>
  useQuery({
    queryKey: [ ...inquiryKeys.all, 'hasNew' ],
    queryFn: api.hasNew,
    /*
     * TODO: once updates come through cable, drop the polling (or keep a long fallback, ~10 min) and
     * invalidate inquiryKeys.all from the subscription's `received` and `connected` callbacks instead
     */
    refetchInterval: 60_000,
  })

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
