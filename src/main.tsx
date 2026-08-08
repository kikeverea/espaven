import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { routeTree } from './routeTree.gen'
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { queryClient } from './queryClient'

const router = createRouter({ routeTree, context: { queryClient } })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)