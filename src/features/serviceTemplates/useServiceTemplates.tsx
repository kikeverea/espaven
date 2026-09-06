import { type ServiceTemplate, type FormServiceTemplate } from './types'
import api from '@/features/serviceTemplates/data/serviceTemplates.service'
import { useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const inquiryKeys = {
  all: ['inquiries'] as const,
  create: ['inquiries', 'create'] as const,
  update: ['inquiries', 'update'] as const,
  delete: ['inquiries', 'delete'] as const,
}

const inquiriesApi = {
  create: api.createServiceTemplate,
  update: api.updateServiceTemplate,
  delete: api.deleteServiceTemplate,
  deleteAll: api.deleteInquiries
}

export const useServiceTemplateMutations = () => {
  return useMutations<ServiceTemplate, FormServiceTemplate>(inquiryKeys, inquiriesApi, { batchDelete: true })
}

export const useServiceTemplates = (target: 'active' | 'discarded') => {
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