import { type ServiceTemplate, type FormServiceTemplate } from './types'
import api from '@/features/serviceTemplates/data/serviceTemplate.api'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const serviceTemplateKeys = resourceKeys('serviceTemplates')

export const useServiceTemplateMutations = () =>
  useMutations<ServiceTemplate, FormServiceTemplate>(serviceTemplateKeys, api, { batchDelete: true })

export const useServiceTemplates = (target: 'active' | 'discarded') =>
  useQuery({
    queryKey: serviceTemplateKeys.all,
    queryFn: () => api.getAll(),
    select: data => ({
      ...data,
      collection: data.collection.filter(template =>
        target === 'active'
          ? !template.discardedAt
          : !!template.discardedAt
      ),
    }),
  })

/* The templates to pick from: the top level ones, a group's children within it */
export const useServiceCatalogue = () =>
  useQuery({
    queryKey: [ ...serviceTemplateKeys.all, 'catalogue' ],
    queryFn: () => api.getAll({}, { roots: true }),
    select: data => data.collection.filter(template => !template.discardedAt),
  })
