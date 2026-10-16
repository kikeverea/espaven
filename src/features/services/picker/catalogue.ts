import type { ServiceTemplate } from '@/features/serviceTemplates/types'
import type { InventoryCategory } from '@/features/inventoryCategories/types'

/* The templates that are picked themselves: a group's children, a lone template itself */
export const leaves = (template: ServiceTemplate): ServiceTemplate[] =>
  template.children?.length ? template.children : [ template ]

export const isGroup = (template: ServiceTemplate) => !!template.children?.length

/* How much of a group is picked: all of it, some or none */
export type PickState = 'all' | 'some' | 'none'

export const pickState = (template: ServiceTemplate, picked: Set<ServiceTemplate['id']>): PickState => {
  const count = leaves(template).filter(({ id }) => picked.has(id)).length
  return count === 0 ? 'none' : count === leaves(template).length ? 'all' : 'some'
}

/* The categories the catalogue offers, with their templates, as their order is first met */
export type CatalogueCategory = { category: InventoryCategory, templates: ServiceTemplate[] }

export const byCategory = (templates: ServiceTemplate[]): CatalogueCategory[] => {
  const categories = new Map<InventoryCategory['id'], CatalogueCategory>()

  templates.forEach(template => {
    const category = template.inventoryCategory
    if (!category) return

    const entry = categories.get(category.id) ?? { category, templates: [] }
    entry.templates.push(template)
    categories.set(category.id, entry)
  })

  return [ ...categories.values() ]
}

/* For searching: lower case, without accents, so 'liquido' finds 'Líquido' */
const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

/* The leaves, a group's children among them, whose name or group's name has `search` in it */
export const searchLeaves = (templates: ServiceTemplate[], search: string): ServiceTemplate[] => {
  const term = fold(search.trim())

  return templates.flatMap(template =>
    fold(template.name).includes(term)
      ? leaves(template)
      : leaves(template).filter(leaf => leaf !== template && fold(leaf.name).includes(term))
  )
}

/* The items a template uses, a group's children's together */
export const itemCount = (template: ServiceTemplate): number =>
  leaves(template).reduce((count, leaf) => count + (leaf.items?.length ?? 0), 0)
