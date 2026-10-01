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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)