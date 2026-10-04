import { api, collectionParams, type ApiMapper, type CollectionQuery } from '@/api/apiClient'
import type { ForbiddenApiFields } from '@/api/entity.mapper'
import type { EntityCollection } from '@/components/Table/useCollection'
import type { PersistedRecord } from '@/types'
import { type UrlParams, withParams } from '@/lib/urls'

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
    /*
     * params: filters besides paging and sorting, camel cased like the rest of the app. Paging and
     * sorting go last, so a filter of the same name can't take their place
     */
    getAll: (query?: CollectionQuery, params?: UrlParams): Promise<EntityCollection<T>> =>
      apiFetch<EntityCollection<T>>(withParams(path, params || {}, collectionParams(query))),

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
