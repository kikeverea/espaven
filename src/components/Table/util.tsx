import { Trash } from 'lucide-react'
import { toast } from '@/components/ui/toast.tsx'
import type { UseMutateFunction } from '@tanstack/react-query'
import type { Entity } from '@/types.ts'
import type { SelectionAction } from '@/components/Table/types.ts'

export const cellPadding = (): string => {
  return 'py-3 px-5'
}

export const batchDelete = <T extends Entity>
  (mutation: UseMutateFunction<boolean[], Error | null, number[]>, successMessage: string): SelectionAction<T> =>
({
  icon: <Trash className='size-4'/>,
  mutation: mutation,
  variant: 'destructive',
  onSuccess: () => toast.add({ title: successMessage })
})
