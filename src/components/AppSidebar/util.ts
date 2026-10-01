import type { AppSidebarLink, AppSidebarStruct } from '@/components/AppSidebar/AppSidebar.tsx'
import type { AppAbility } from '@/lib/ability.ts'

export const visibleSidebarStruct = (
  struct: AppSidebarStruct,
  ability: AppAbility,
): AppSidebarStruct => {

  const visible = (link: AppSidebarLink) => !link.subject || ability.can('read', link.subject)

  return Object.fromEntries(
    Object.entries(struct)
    .map(([ label, links ]) => [
      label,
      links
      .filter(visible)
      .map(link => link.links ? { ...link, links: link.links.filter(visible) } : link)
    ] as const)
    .filter(([ , links ]) => links.length > 0)
  )
}