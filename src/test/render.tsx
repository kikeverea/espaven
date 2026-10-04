import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
} from '@tanstack/react-router'
import { render as rtlRender } from '@testing-library/react'
import { routeTree } from '@/routeTree.gen'
import { createMongoAbility } from '@casl/ability'
import { rulesFor, type AppAbility } from '@/lib/ability'

export function render(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })

  const router = createRouter({
    routeTree,
    context: { queryClient, ability: createMongoAbility<AppAbility>(rulesFor('admin')) },
    history: createMemoryHistory({
      initialEntries: ['/'],
    }),
  })

  return rtlRender(
    <QueryClientProvider client={queryClient}>
      <RouterContextProvider router={router}>
        {children}
      </RouterContextProvider>
    </QueryClientProvider>
  )
}