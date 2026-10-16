import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { routeTree } from './routeTree.gen'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { queryClient } from './queryClient'
import { ability } from './lib/ability'
import RouteError from './components/RouteError/RouteError'

const router = createRouter({
  routeTree,
  context: { queryClient, ability },
  defaultErrorComponent: RouteError,      // an access denied page when a route's beforeLoad turns the user away
})

/* the endpoints the api does not have yet, see mocks/server.ts */
if (import.meta.env.DEV && import.meta.env.VITE_MOCK_API === 'true') {
  const [ { startMocks }, { handlers } ] = await Promise.all([ import('./mocks/server'), import('./mocks/handlers') ])
  startMocks(handlers)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)