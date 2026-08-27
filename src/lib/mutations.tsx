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

export type MutationApi<T extends object, TWrite extends object = T> = {
  create: (payload: TWrite) => Promise<T>
  update: (id: Entity['id'], payload: TWrite) => Promise<T>
  delete: (payload: T) => Promise<T>
  deleteAll?: (payload: Entity['id'][]) => Promise<boolean[]>
}

export function useMutationStatus<T extends Object>(mutationKey: readonly unknown[], mutationStatus: 'error'): MutationError<T>
export function useMutationStatus<T extends Object>(mutationKey: readonly unknown[], mutationStatus: 'idle'|'pending'): T
export function useMutationStatus<T extends Object>(
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
  args: { batchDelete?: boolean } = {}
): Mutations<T, TWrite> => {
  const client = useQueryClient()

  const invalidate = () => client.invalidateQueries({ queryKey: mutationKeys.all })
  const showError = (error: Error | null) => {
    toast.add({
      title: error?.message,
      type: 'error',
    })
  }

  const create = useMutation({
    mutationKey: mutationKeys.create,
    mutationFn: mutationApi.create,
    onError: showError,
    onSettled: invalidate,
  })

  const update = useMutation({
    mutationKey: mutationKeys.update,
    mutationFn: ({ id, payload }: UpdateParams<TWrite>) => mutationApi.update(id, payload),
    onError: showError,
    onSettled: invalidate,
  })

  const remove = useMutation({
    mutationKey: mutationKeys.delete,
    mutationFn: mutationApi.delete,
    onError: showError,
    onSettled: invalidate,
  })

  const removeAll = args.batchDelete
    ? useMutation({
      mutationKey: [...mutationKeys.delete, 'all'],
      mutationFn: mutationApi.deleteAll,
      onError: showError,
      onSettled: invalidate,
    })
    : null

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
      any: !!creating || !!deleting,
      current: (item) => (
        (creating && creating as unknown as T) ||
        (updating?.id === item.id && updating) ||
        (deleting?.id === item.id && deleting) ||
        null
      )
    },
    errors: {
      creating: createError,
      updating: updateError,
      deleting: deleteError,
      any: !!createError || !!deleteError,
      error: (item?: T) => (
        deleteError?.item?.id === item?.id ? deleteError.error : createError.error
      )
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