import {  createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar.tsx"
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { queryClient } from '@/queryClient'
import { Toaster } from "@/components/ui/toast"

export type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return (
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className='h-full'>
              <Outlet />
            </div>
            <Toaster />
            <TanStackRouterDevtools />
          </SidebarInset>
        </SidebarProvider>
      </QueryClientProvider>
    )
  }
})