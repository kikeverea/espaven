import {
  type MutationStatus,
  type UseMutateFunction,
  useMutation,
  useMutationState,
  useQueryClient
} from '@tanstack/react-query'
import type { Entity } from '@/types.ts'

export type Mutations<T extends Entity, NT extends Partial<Omit<Entity, 'id'>>> = {
  create: UseMutateFunction<T, Error, NT>
  update: UseMutateFunction<T, Error, T>
  remove: UseMutateFunction<T, Error, T>
  status: MutationStatusTypes<T, NT>
}

type QueryActions<T> = {
  creating: T | null,
  deleting: T | null,
  any: boolean,
}

type PendingActions<T extends Entity> = { current: (item: T) => T | null }
type ErrorAction<T extends Entity> = { error: (item: T) => Error | null }

type MutationStatusTypes<T extends Entity, NT extends Partial<Omit<Entity, 'id'>>> = {
  pending: QueryActions<T | NT> & PendingActions<T>
  errors: QueryActions<MutationError<T | NT>> & ErrorAction<T>
}

type MutationError<T extends Object> = { item: T, error: Error | null}
type MutationKey = string | number

export type MutationKeys = {
  all: readonly MutationKey[]
  create: readonly [...MutationKey[], 'create']
  update: readonly [...MutationKey[], 'update']
  delete: readonly [...MutationKey[], 'delete']
}

export type MutationApi<T extends Entity, NT extends Partial<Omit<Entity, 'id'>>> = {
  create: (payload: NT) => Promise<T>
  update: (payload: T) => Promise<T>
  delete: (payload: T) => Promise<T>
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

export const useMutations = <T extends Entity, NT extends Partial<Omit<Entity, 'id'>>>(
  mutationKeys: MutationKeys,
  mutationApi: MutationApi<T, NT>
): Mutations<T, NT> => {
  const client = useQueryClient()

  const invalidate = () => client.invalidateQueries({ queryKey: mutationKeys.all })

  const create = useMutation({
    mutationKey: mutationKeys.create,
    mutationFn: mutationApi.create,
    onSettled: invalidate,
  })

  const update = useMutation({
    mutationKey: mutationKeys.update,
    mutationFn: mutationApi.update,
    onSettled: invalidate,
  })

  const remove = useMutation({
    mutationKey: mutationKeys.delete,
    mutationFn: mutationApi.delete,
    onSettled: invalidate,
  })

  const creating = useMutationStatus<NT>(mutationKeys.create, 'pending')
  const deleting = useMutationStatus<T>(mutationKeys.delete, 'pending')

  const createError = useMutationStatus<NT>(mutationKeys.create, 'error')
  const deleteError = useMutationStatus<T>(mutationKeys.delete, 'error')

  const status: MutationStatusTypes<T, NT> = {
    pending: {
      creating,
      deleting,
      any: !!creating || !!deleting,
      current: (item) => (
        (creating && creating as unknown as T) ||
        (deleting?.id === item.id && deleting) ||
        null
      )
    },
    errors: {
      creating: createError,
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
    status
  }
}