import {  createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar/AppSidebar.tsx"
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { queryClient } from '@/queryClient'
import { Toaster } from "@/components/ui/toast"
import { BlinkProvider } from '@/components/Blinker/BlinkContext.tsx'
import { AbilityProvider } from '@casl/react'
import { ability, type AppAbility } from '@/lib/ability.ts'
import { Inbox, User, CirclePile, Scale, NotepadTextDashed, Wrench, ChartBarStacked, Cog } from 'lucide-react'

export type RouterContext = {
  queryClient: QueryClient
  ability: AppAbility
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    return (
      <QueryClientProvider client={queryClient}>
        <AbilityProvider value={ ability }>
        <BlinkProvider>
          <SidebarProvider>
            <AppSidebar struct={{
              CRM: [
                { label: 'Solicitudes', path: '/inquiries', icon: <Inbox />, subject: 'Inquiry' },
                { label: 'Clientes', path: '/clients', icon: <User />, subject: 'Contact' },
              ],
              Servicios: [
                { label: 'Activos', path: '/services', icon: <Wrench />, subject: 'Service' },
                { label: 'Plantillas', path: '/service_templates', icon: <NotepadTextDashed />, subject: 'ServiceTemplate' },
              ],
              Inventario: [
                { label: 'Inventario', path: '/inventory', icon: <CirclePile />, subject: 'Inventory' },
                { label: 'Categorías', path: '/inventory_categories', icon: <ChartBarStacked />, subject: 'InventoryCategory' },
                { label: 'Partes y consumibles', path: '/inventory_items', icon: <Cog />, subject: 'InventoryItem' },
                { label: 'Uds. de medida', path: '/units_of_measure', icon: <Scale />, subject: 'UnitOfMeasure' },
              ],
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
        </AbilityProvider>
      </QueryClientProvider>
    )
  }
})