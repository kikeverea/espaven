import { type MutationStatus, useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query'
import { type NewInquiry, type Inquiry } from '../types'
import api from './inquiry.service'

type QueryActions<T> = {
  creating: T | null,
  deleting: T | null,
  any: boolean,
}

type PendingActions = { current: (inquiry: Inquiry) => Inquiry | null }
type ErrorAction = { error: (inquiry: Inquiry) => boolean }

type InquiryMutationStatus = {
  pending: QueryActions<Inquiry | NewInquiry> & PendingActions,
  errors: QueryActions<Inquiry | NewInquiry> & ErrorAction,
}

const inquiryKeys = {
  all: ['inquiries'] as const,
  create: ['inquiries', 'create'] as const,
  update: ['inquiries', 'update'] as const,
  delete: ['inquiries', 'delete'] as const,
}

const useInquiryMutationStatus = <T extends NewInquiry | Inquiry>(
  targetMutation: Exclude<keyof typeof inquiryKeys, 'all'>,
  mutationStatus: MutationStatus
): T | null => {
  return useMutationState<T>({
    filters: {
      mutationKey: inquiryKeys[targetMutation],
      status: mutationStatus,
    },
    select: mutation => mutation.state.variables as T,
  }).at(-1) ?? null
}

export const useInquiryMutations = () => {
  const client = useQueryClient()

  const invalidate = () => client.invalidateQueries({ queryKey: inquiryKeys.all })

  const create = useMutation({
    mutationKey: inquiryKeys.create,
    mutationFn: api.createInquiry,
    onSettled: invalidate,
  })

  const update = useMutation({
    mutationKey: inquiryKeys.update,
    mutationFn: api.updateInquiry,
    onSettled: invalidate,
  })

  const remove = useMutation({
    mutationKey: inquiryKeys.delete,
    mutationFn: api.deleteInquiry,
    onSettled: invalidate,
  })

  const creating = useInquiryMutationStatus<NewInquiry>('create', 'pending')
  const deleting = useInquiryMutationStatus<Inquiry>('delete', 'pending')

  const createError = useInquiryMutationStatus<NewInquiry>('create', 'error')
  const deleteError = useInquiryMutationStatus<Inquiry>('delete', 'error')

  const status: InquiryMutationStatus = {
    pending: {
      creating,
      deleting,
      any: !!creating || !!deleting,
      current: (inquiry) => (
        (creating && creating as Inquiry) ||
        (deleting?.id === inquiry.id && deleting) ||
        null
      )
    },
    errors: {
      creating: createError,
      deleting: deleteError,
      any: !!createError || !!deleteError,
      error: (inquiry?: Inquiry) => (
        deleteError?.id === inquiry?.id || !!createError
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

export const useInquiries = () => {
  const { data: inquiries, isPending, isError } = useQuery({ queryKey: inquiryKeys.all, queryFn: api.getInquiries })
  return { inquiries, isPending, isError }
}