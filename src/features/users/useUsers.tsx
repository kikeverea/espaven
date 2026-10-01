import { type User, type FormUser } from './types.ts'
import api from '@/features/users/data/user.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { TableQuery } from '@/components/Table/hooks/useTableQuery'

const userKeys = resourceKeys('users')

export const useUserMutations = () =>
  useMutations<User, FormUser>(userKeys, api, { batchDelete: true })

export const useUsers = (query?: TableQuery) =>
  useQuery({
    queryKey: [...userKeys.all, query?.page ?? 1, query?.perPage ?? null, query?.search ?? '', query?.sort ?? null],
    queryFn: () => api.getAll(query),
    placeholderData: keepPreviousData,      // keep the current page on screen while the next one loads
  })
