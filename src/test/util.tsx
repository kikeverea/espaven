import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render as rtlRender } from '@testing-library/react'

export function render(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,                 // everything is stale immediately
        refetchOnMount: 'always',     // force refetch even with initialData
        refetchOnWindowFocus: false,
        gcTime: Infinity
      },
      mutations: {
        retry: false,
      },
    },
  })

  return rtlRender(<QueryClientProvider client={client}>{children}</QueryClientProvider>)
}