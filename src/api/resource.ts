import { api, collectionQuery, type ApiMapper, type CollectionQuery } from '@/api/apiClient'
import type { ForbiddenApiFields } from '@/api/entity.mapper'
import type { EntityCollection } from '@/components/Table/useCollection'
import type { PersistedRecord } from '@/types'

export const createResource = <
  T extends PersistedRecord,
  TWrite extends object = Partial<T>,
  TApiIn = T,
  TApiOut extends object & ForbiddenApiFields = ForbiddenApiFields
>
(path: string, mapper?: ApiMapper<T, TApiIn, TApiOut>) =>
{
  const { apiFetch, fetch } = api<T, TApiIn, TApiOut>(mapper)

  return {
    getAll: (query?: CollectionQuery): Promise<EntityCollection<T>> =>
      apiFetch<EntityCollection<T>>(`${path}${collectionQuery(query)}`),

    get: (id: T['id']): Promise<T> =>
      apiFetch<T>(`${path}/${id}`),

    create: (payload: TWrite): Promise<T> =>
      apiFetch<T>(path, { method: 'POST', body: payload as Partial<T> }),

    update: (id: T['id'], payload: TWrite): Promise<T> =>
      apiFetch<T>(`${path}/${id}`, { method: 'PUT', body: payload as Partial<T> }),

    delete: (item: Pick<T, 'id'>): Promise<T> =>
      apiFetch<T>(`${path}/${item.id}`, { method: 'DELETE' }),

    deleteAll: (ids: T['id'][]): Promise<boolean[]> =>
      fetch<boolean[]>(`${path}/batch_destroy`, { method: 'POST', body: { ids } }),
  }
}

export type Resource<T extends PersistedRecord, TWrite extends object = Partial<T>> =
  ReturnType<typeof createResource<T, TWrite>>
