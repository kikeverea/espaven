import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type NewInquiry, type Inquiry } from '../types'
import api from './inquiry.service'

type QueryActions<T> = {
  fetching: boolean,
  creating: T | null,
  deleting: T | null,
  any: boolean,
}

type PendingActions = {
  current: (inquiry: Inquiry) => Inquiry | null
}

type ErrorAction = { error: (inquiry: Inquiry) => string }

type InquiryMutationStatus = {
  pending: QueryActions<Inquiry | NewInquiry> & PendingActions,
  errors: QueryActions<Inquiry | NewInquiry> & ErrorAction,
}

const useInquiries = () => {

  const client = useQueryClient()

  const { data: inquiries, isPending, isError } = useQuery({ queryKey: [ 'inquiries' ], queryFn: api.getInquiries })

  const createMutation = useMutation({
    mutationFn: (inquiry: NewInquiry) => api.createInquiry(inquiry),
    onSettled: () => client.invalidateQueries({ queryKey: ['inquiries'] })
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteInquiry,
    onSettled: () => client.invalidateQueries({ queryKey: ['inquiries'] })
  })

  const create = (inquiry: NewInquiry) => createMutation.mutate(inquiry)
  const remove = (inquiry: Inquiry) => deleteMutation.mutate(inquiry)

  const status: InquiryMutationStatus = {
    pending: {
      fetching: isPending,
      creating: createMutation.isPending ? createMutation.variables : null,
      deleting: deleteMutation.isPending ? deleteMutation.variables : null,
      any: createMutation.isPending || deleteMutation.isPending,
      current: (inquiry) => (
        (createMutation.isPending && createMutation.variables as Inquiry) ||
        (deleteMutation.isPending && deleteMutation.variables.id === inquiry.id && deleteMutation.variables) ||
        null
      )
    },
    errors: {
      fetching: isError,
      creating: createMutation.isError ? createMutation.variables : null,
      deleting: deleteMutation.isError ? deleteMutation.variables : null,
      any: createMutation.isError || deleteMutation.isError,
      error: (todo) => (
        (createMutation.isError && 'Could not create') ||
        (deleteMutation.isError && deleteMutation.variables.id === todo.id && 'Could not delete') ||
        ''
      )
    }
  }

  return { inquiries, create, remove, status }
}

export default useInquiries