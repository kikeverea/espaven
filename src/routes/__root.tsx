import {  createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar.tsx"
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { queryClient} from '@/queryClient'

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
            <SidebarTrigger />
            <div className='p-6'>
              <Outlet />
            </div>
            <TanStackRouterDevtools />
          </SidebarInset>
        </SidebarProvider>
      </QueryClientProvider>
    )
  }
})