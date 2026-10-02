import { type Service, type FormService } from './types'
import api from '@/features/services/data/service.api'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'

const serviceKeys = resourceKeys('services')

export const useServiceMutations = () =>
  useMutations<Service, FormService>(serviceKeys, api, { batchDelete: true })

export const useServices = (target: 'active' | 'discarded') =>
  useQuery({
    queryKey: serviceKeys.all,
    queryFn: () => api.getAll(),
    select: data => ({
      ...data,
      collection: data.collection.filter(service =>
        target === 'active'
          ? !service.discardedAt
          : !!service.discardedAt
      ),
    }),
  })
