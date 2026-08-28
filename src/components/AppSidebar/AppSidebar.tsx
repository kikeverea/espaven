import { Link } from '@tanstack/react-router'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from '@/components/ui/sidebar.tsx'
import { type ReactNode } from 'react'

export type AppSidebarStruct = Record<string, AppSidebarLink[]>

export type AppSidebarLink = {
  path: string
  icon: ReactNode
  label: string
  links?: AppSidebarLink[]
}

export function AppSidebar({ struct }: { struct: AppSidebarStruct }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem>
          CRM
        </SidebarMenuItem>
      </SidebarHeader>

      <SidebarContent>
        {Object.entries(struct).map(([label, links], ind) =>
          <SidebarGroup key={`${label}-group-${ind}`}>
            <SidebarGroupLabel>{ label }</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                { links.map(({ label, icon, path, links }, itemInd) =>
                  <SidebarMenuItem className='mb-2' key={`${label}-item-${itemInd}`}>
                    <Link to={ path } className='w-full'>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive} className='cursor-pointer'>
                          { icon }
                          <span>{ label }</span>
                        </SidebarMenuButton>
                      )}
                    </Link>
                    { links?.map(({ label, icon, path}) =>
                      <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <Link to={ path } className='w-full'>
                          {({ isActive }) => (
                            <SidebarMenuSubButton isActive={isActive} className='cursor-pointer'>
                              { icon }
                              <span>{ label }</span>
                            </SidebarMenuSubButton>
                          )}
                        </Link>
                      </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}