import { type User, type FormUser, type Technician } from './types.ts'
import api from '@/features/users/data/user.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { CollectionQuery } from '@/api/apiClient.ts'

const userKeys = resourceKeys('users')

export const useUserMutations = () =>
  useMutations<User, FormUser>(userKeys, api, { batchDelete: true })

export const useUsers = (query?: CollectionQuery, params?: Record<string, string>) =>
  useQuery({
    queryKey: userKeys.list(query, params),
    queryFn: () => api.getAll(query, params),
    placeholderData: keepPreviousData,      // keep the current page on screen while the next one loads
  })

export const useTechnicians = () =>
  useQuery({
    queryKey: [ ...userKeys.all, 'technicians' ],
    queryFn: () => api.getAll({}, { type: 'technician' }),
    select: data => data.collection.filter(user => user.roles?.includes('technician')) as Technician[],
  })
