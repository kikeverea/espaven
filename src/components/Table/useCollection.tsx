import { useState } from 'react'
import type { Entity, Pagination } from '@/types.ts'
import { findById } from '@/lib/utils.ts'
import { toast } from '@/components/ui/toast.tsx'
import type { Mutations } from '@/lib/mutations.tsx'
import type { UseQueryResult } from '@tanstack/react-query'
import type { ServerTable } from '@/components/Table/types.ts'
import type { TableQuery } from '@/components/Table/hooks/useTableQuery.ts'

export type EntityCollection<T extends Entity> = {
  collection: T[],
  pagination?: Pagination
}

export const useCollection =
  <T extends Entity, FT extends object>
  (
    entityName: string | [string, 'm' | 'f'],
    queryResult: UseQueryResult<NoInfer<EntityCollection<T>>, Error>,
    mutations: Mutations<T, FT>,
    tableQuery?: TableQuery
  ) =>
{
  const [formItemId, setFormItemId] = useState<T['id'] | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<T['id'] | null>(null)

  const { data = { collection: [] }, isLoading } = queryResult
  const { remove: removeMutation, removeAll } = mutations

  const { collection, pagination } = data

  // pass this straight to the Table: it is the whole server side half of its contract
  const server: ServerTable | undefined = tableQuery && {
    pagination,
    sort: tableQuery.sort,
    search: tableQuery.search,
    setPage: tableQuery.setPage,
    setPerPage: tableQuery.setPerPage,
    setSearch: tableQuery.setSearch,
    setSort: tableQuery.setSort,
  }
  const [ name , gender ] = Array.isArray(entityName) ? entityName: [entityName, 'm']

  const find = (id: T['id'] | null): T | null => {
    if (id == null)
      return null

    return id === 0 ?
      {} as T :
      findById(collection, id)
  }

  const remove = (id: T['id']) => {
    const item = find(id)

    if (!item) return

    removeMutation(item, { onSuccess: () => {
      if (selectedItemId === id)
        setSelectedItemId(null)

      toast.add({ title: `${name} ${gender === 'm' ? 'descartado' : 'descartada'}`})
    }})
  }

  return {
    collection,
    pagination,
    server,
    isLoading,
    find,
    remove,
    removeAll,
    formItem: {
      id: () => formItemId,
      get: () => find(formItemId),
      set: (item: T['id'] | T | null) =>
        typeof item === 'string' || typeof item === 'number'
          ? setFormItemId(item)
          : setFormItemId(item ? item.id || 0 : null)       // '0' for new items (ie: no id)
    },
    selectedItem: {
      id: () => selectedItemId,
      get: () => find(selectedItemId),
      set: (item: T['id'] | T | null) =>
        typeof item === 'string' || typeof item === 'number'
          ? setSelectedItemId(item)
          : setSelectedItemId(item ? item.id || 0 : null)    // '0' for new items (ie: no id)
    },
  }
}

