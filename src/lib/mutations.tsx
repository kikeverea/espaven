import {
  type MutationStatus,
  type UseMutateFunction,
  useMutation,
  useMutationState,
  useQueryClient
} from '@tanstack/react-query'
import { toast } from '@/components/ui/toast'
import type { Entity } from '@/types.ts'

export type Mutations<T extends object, TWrite extends object = T> = {
  create: UseMutateFunction<T, Error | null, TWrite>
  update: UseMutateFunction<T, Error | null, UpdateParams<TWrite>>
  remove: UseMutateFunction<T, Error | null, T>
  removeAll?: UseMutateFunction<boolean[], Error | null, Entity['id'][]>
  status: MutationStatusTypes<T>
}

type QueryActions<T> = {
  creating: T | null
  updating: T | null
  deleting: T | null
  any: boolean,
}

type PendingActions<T> = { current: (item: T) => T | null }
type ErrorAction<T> = { error: (item: T) => Error | null }

type MutationStatusTypes<T> = {
  pending: QueryActions<T> & PendingActions<T>
  errors: QueryActions<MutationError<T>> & ErrorAction<T>
}

type MutationError<T> = { item: T, error: Error | null}
type MutationKey = string | number
type UpdateParams<TWrite> = { id: Entity['id'], payload: TWrite }

export type MutationKeys = {
  all: readonly MutationKey[]
  create: readonly [...MutationKey[], 'create']
  update: readonly [...MutationKey[], 'update']
  delete: readonly [...MutationKey[], 'delete']
}

/* The four keys a resource mutates under. `name` is what it is called in the cache ('genericParts') */
export const resourceKeys = (name: string): MutationKeys => ({
  all: [name] as const,
  create: [name, 'create'] as const,
  update: [name, 'update'] as const,
  delete: [name, 'delete'] as const,
})

export type MutationApi<T extends object, TWrite extends object = T> = {
  create: (payload: TWrite) => Promise<T>
  update: (id: Entity['id'], payload: TWrite) => Promise<T>
  delete: (payload: T) => Promise<T>
  deleteAll?: (payload: Entity['id'][]) => Promise<boolean[]>
}

export type MutationSideEffects<T extends Entity> = {
  create?: (item: T) => void
  update?: (item: T) => void
  delete?: (item: T) => void
}

export function useMutationStatus<T extends object>(mutationKey: readonly unknown[], mutationStatus: 'error'): MutationError<T> | null
export function useMutationStatus<T extends object>(mutationKey: readonly unknown[], mutationStatus: 'idle'|'pending'): T | null
export function useMutationStatus<T extends object>(
  mutationKey: readonly unknown[],
  mutationStatus: MutationStatus
): T | MutationError<T> | null
{
  return useMutationState({
    filters: {
      mutationKey: mutationKey,
      status: mutationStatus,
    },
    select: mutation => (
      mutationStatus !== 'error'
        ? mutation.state.variables as T
        : {
            item: mutation.state.variables as T,
            error: mutation.state.error,
          }),
  }).at(-1) ?? null
}

export const useMutations = <T extends Entity, TWrite extends object = T>(
  mutationKeys: MutationKeys,
  mutationApi: MutationApi<T, TWrite>,
  args: { batchDelete?: boolean, mutationSideEffects?: MutationSideEffects<T> } = {}
): Mutations<T, TWrite> => {
  const client = useQueryClient()

  const invalidate = () => client.invalidateQueries({ queryKey: mutationKeys.all })
  const showError = (error: Error | null) => {
    toast.add({
      title: error?.message,
      type: 'error'
    })
  }

  const create = useMutation({
    mutationKey: mutationKeys.create,
    mutationFn: mutationApi.create,
    onError: showError,
    onSuccess: args.mutationSideEffects?.create,
    onSettled: invalidate,
  })

  const update = useMutation({
    mutationKey: mutationKeys.update,
    mutationFn: ({ id, payload }: UpdateParams<TWrite>) => mutationApi.update(id, payload),
    onError: showError,
    onSuccess: args.mutationSideEffects?.update,
    onSettled: invalidate,
  })

  const remove = useMutation({
    mutationKey: mutationKeys.delete,
    mutationFn: mutationApi.delete,
    onSuccess: args.mutationSideEffects?.delete,
    onError: showError,
    onSettled: invalidate,
  })

  /* Always declared: a hook behind a condition changes the hook order between renders */
  const removeAll = useMutation({
    mutationKey: [...mutationKeys.delete, 'all'],
    mutationFn: (ids: Entity['id'][]) => {
      if (!mutationApi.deleteAll)
        return Promise.reject(new Error('Esta colección no admite borrado en lote'))

      return mutationApi.deleteAll(ids)
    },
    onError: showError,
    onSettled: invalidate,
  })

  const creating = useMutationStatus<T>(mutationKeys.create, 'pending')
  const updating = useMutationStatus<T>(mutationKeys.update, 'pending')
  const deleting = useMutationStatus<T>(mutationKeys.delete, 'pending')

  const createError = useMutationStatus<T>(mutationKeys.create, 'error')
  const updateError = useMutationStatus<T>(mutationKeys.update, 'error')
  const deleteError = useMutationStatus<T>(mutationKeys.delete, 'error')

  const status: MutationStatusTypes<T> = {
    pending: {
      creating,
      deleting,
      updating,
      any: !!creating || !!updating || !!deleting,
      /* Which mutation, if any, is running on this very item. A create has no id to match yet */
      current: (item) => (
        (creating?.id === item.id && creating) ||
        (updating?.id === item.id && updating) ||
        (deleting?.id === item.id && deleting) ||
        null
      )
    },
    errors: {
      creating: createError,
      updating: updateError,
      deleting: deleteError,
      any: !!createError || !!updateError || !!deleteError,
      error: (item?: T) =>
        [ createError, updateError, deleteError ]
          .find(failed => failed?.item?.id === item?.id)
          ?.error ?? null
    }
  }

  return {
    create: create.mutate,
    update: update.mutate,
    remove: remove.mutate,
    ...(args.batchDelete ? { removeAll: removeAll?.mutate } : {}),
    status
  }
}