import { Link, useRouter } from '@tanstack/react-router'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from '@/components/ui/sidebar.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import type { Role } from '@/features/users/types.ts'
import { rulesFor, type AppAbility, type Subject } from '@/lib/ability.ts'
import { visibleSidebarStruct } from '@/components/AppSidebar/util.ts'
import { useAbility } from '@casl/react'
import { type ReactNode, useState } from 'react'

export type AppSidebarStruct = Record<string, AppSidebarLink[]>

export type AppSidebarLink = {
  path: string
  icon: ReactNode
  label: string
  links?: AppSidebarLink[]
  subject?: Subject
  badge?: ReactNode         // over the icon, like a blinker for what is new
}

const roles: { label: string, value: Role }[] = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Oficina', value: 'office' },
  { label: 'Técnico', value: 'technician' },
]

export function AppSidebar({ struct }: { struct: AppSidebarStruct }) {
  const ability = useAbility<AppAbility>()
  const router = useRouter()

  /* TODO: the signed in user's rules, once there is one. The role is switched by hand for now */
  const [ role, setRole ] = useState<Role>('admin')

  const switchRole = (role: Role) => {
    setRole(role)
    ability.update(rulesFor(role))
    router.invalidate()        // the routes' beforeLoad check the open page against the new rules
  }

  const visibleLinks = visibleSidebarStruct(struct, ability)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuItem>
          CRM
        </SidebarMenuItem>
      </SidebarHeader>

      <SidebarContent>
        {Object.entries(visibleLinks).map(([label, links], ind) =>
          <SidebarGroup key={`${label}-group-${ind}`}>
            <SidebarGroupLabel>{ label }</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                { links.map(({ label, icon, path, links, badge }, itemInd) =>
                  <SidebarMenuItem className='mb-2' key={`${label}-item-${itemInd}`}>
                    <Link to={ path } className='w-full'>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive} className='relative cursor-pointer'>
                          { icon }
                          { badge }
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

      <SidebarFooter className='group-data-[collapsible=icon]:hidden pb-48'>
        <Select items={ roles } value={ role } onValueChange={ value => value && switchRole(value) }>
          <SelectTrigger aria-label='Rol' className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            { roles.map(({ label, value }) =>
              <SelectItem key={ value } value={ value }>{ label }</SelectItem>
            )}
          </SelectContent>
        </Select>
      </SidebarFooter>
    </Sidebar>
  )
}