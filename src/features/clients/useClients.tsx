import type { Contact, FormContact } from '@/features/inquiries/types'
import api from '@/features/clients/data/client.api'
import { resourceKeys, useMutations } from '@/lib/mutations'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { CollectionQuery } from '@/api/apiClient'

const clientKeys = resourceKeys('clients')

export const useClientMutations = () =>
  useMutations<Contact, FormContact>(clientKeys, api)

export const useClients = (query?: CollectionQuery) =>
  useQuery({
    queryKey: clientKeys.list(query),
    queryFn: () => api.getAll(query),
    placeholderData: keepPreviousData,
  })

/* A client's full name: 'Laura Martín Soler' */
export const fullName = (client: Pick<Contact, 'name' | 'lastName'>) => [ client.name, client.lastName ].filter(Boolean).join(' ')

/* The phone to call them on: the primary one, or the first */
export const phoneOf = (client: Pick<Contact, 'phoneNumbers'>) =>
  (client.phoneNumbers?.find(({ primary }) => primary) ?? client.phoneNumbers?.[0])?.number
