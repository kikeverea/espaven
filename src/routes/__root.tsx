import {  createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar/AppSidebar.tsx"
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { queryClient } from '@/queryClient'
import { Toaster } from "@/components/ui/toast"
import { BlinkProvider } from '@/components/Blinker/BlinkContext.tsx'
import { Inbox, User, CirclePile, Scale } from 'lucide-react'

export type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return (
      <QueryClientProvider client={queryClient}>
        <BlinkProvider>
          <SidebarProvider>
            <AppSidebar struct={{
              CRM: [
                { label: 'Solicitudes', path: '/inquiries', icon: <Inbox /> },
                { label: 'Clientes', path: '/clients', icon: <User /> },
              ],
              Inventario: [
                { label: 'Inventario', path: '/inventory', icon: <CirclePile /> },
                { label: 'Uds. de medida', path: '/units_of_measure', icon: <Scale /> },
              ]
            }}/>
            <SidebarInset>
              <div className='h-full'>
                <Outlet />
              </div>
              <Toaster />
              <TanStackRouterDevtools />
            </SidebarInset>
          </SidebarProvider>
        </BlinkProvider>
      </QueryClientProvider>
    )
  }
})