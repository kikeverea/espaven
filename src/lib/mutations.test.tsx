import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMutations, type MutationApi, type MutationKeys } from '@/lib/mutations.tsx'
import type { ReactNode } from 'react'
import { expect, vi } from 'vitest'

vi.mock('@/components/ui/toast.tsx', () => ({ toast: { add: vi.fn() }}))

describe('useMutations', () => {

  type Animal = { id: number, name: string }

  const keys: MutationKeys = {
    all: ['animals'],
    create: ['animals', 'create'],
    update: ['animals', 'update'],
    delete: ['animals', 'delete'],
  }

  const cat = { id: 1, name: 'Cat' }
  const dog = { id: 2, name: 'Dog' }

  /* Never settles: the mutation stays pending for as long as the assertions need it */
  const pending = <T,>(): Promise<T> => new Promise(() => {})

  const api: MutationApi<Animal, Animal> = {
    create: pending,
    update: pending,
    delete: pending,
  }

  const renderMutations = () => {
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false }}})
    const wrapper = ({ children }: { children: ReactNode }) =>
      <QueryClientProvider client={client}>{ children }</QueryClientProvider>

    return renderHook(() => useMutations<Animal, Animal>(keys, api), { wrapper })
  }

  test('an update in flight counts as pending', async () => {
    const { result } = renderMutations()

    expect(result.current.status.pending.any).toBe(false)

    result.current.update(cat)

    await waitFor(() => expect(result.current.status.pending.any).toBe(true))
  })

  test('only the item being updated reports as current', async () => {
    const { result } = renderMutations()

    result.current.update(cat)

    await waitFor(() => expect(result.current.status.pending.current(cat)).toBeTruthy())
    expect(result.current.status.pending.current(dog)).toBeNull()
  })

  test('a create leaves the existing items alone', async () => {
    const { result } = renderMutations()

    result.current.create({ name: 'New' } as Animal)

    await waitFor(() => expect(result.current.status.pending.any).toBe(true))
    expect(result.current.status.pending.current(cat)).toBeNull()
    expect(result.current.status.pending.current(dog)).toBeNull()
  })
})
