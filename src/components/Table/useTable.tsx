import { useState } from 'react'
import type { Entity } from '@/types.ts'
import { findById } from '@/lib/utils.ts'
import { toast } from '@/components/ui/toast.tsx'
import type { Mutations } from '@/lib/mutations.tsx'
import type { UseQueryResult } from '@tanstack/react-query'

export const useTable =
  <T extends Entity, FT extends object>
  (queryResult: UseQueryResult<NoInfer<T[]>, Error>, mutations: Mutations<T, FT>) =>
{
  const [formItemId, setFormItemId] = useState<T['id'] | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<T['id'] | null>(null)

  const { data: collection = [], isLoading } = queryResult
  const { remove: removeMutation, removeAll } = mutations

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

      toast.add({ title: 'Solicitud descartada' })
    }})
  }

  return {
    collection,
    isLoading,
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

