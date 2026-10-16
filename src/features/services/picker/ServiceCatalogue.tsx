import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { ServiceTemplate } from '@/features/serviceTemplates/types'
import type { InventoryCategory } from '@/features/inventoryCategories/types'
import { byCategory, leaves, searchLeaves } from '@/features/services/picker/catalogue'
import { count } from '@/features/services/picker/hours'
import SlideTrack from '@/features/services/picker/SlideTrack'
import CategoryTile, { TILE_GRID } from '@/features/services/picker/CategoryTile'
import ServiceCard, { CARD_COLUMNS } from '@/features/services/picker/ServiceCard'

type ServiceCatalogueProps = {
  templates: ServiceTemplate[]
  isLoading: boolean
  search: string
  picked: Set<ServiceTemplate['id']>
  onToggle: (templates: ServiceTemplate[], pick: boolean) => void
  onCreate: (category?: InventoryCategory) => void      // in the category open, if any
}

const Empty = ({ children }: { children: string }) => <p className='py-6 text-center text-sm text-[#78716C]'>{ children }</p>

/*
 * The services to pick from, by category: a category opens on its services, a search on the
 * services found in all of them
 */
const ServiceCatalogue = ({ templates, isLoading, search, picked, onToggle, onCreate }: ServiceCatalogueProps) => {
  const [ openId, setOpenId ] = useState<InventoryCategory['id'] | null>(null)

  const categories = byCategory(templates)
  const open = categories.find(({ category }) => category.id === openId)
  const found = search.trim() ? searchLeaves(templates, search) : null

  const pickedIn = (templates: ServiceTemplate[]) => templates.flatMap(leaves).filter(({ id }) => picked.has(id)).length
  const groupOf = (leaf: ServiceTemplate) => templates.find(template => template.children?.some(({ id }) => id === leaf.id))?.name

  const trail = found
    ? { label: `Resultados de «${search.trim()}»`, count: found.length }
    : open ? { label: open.category.name, count: open.templates.length } : null

  return (
    <SlideTrack
      root='Servicios'
      trail={ trail }
      onBack={() => setOpenId(null)}
      action={
        <button
          type='button'
          onClick={() => onCreate(open?.category)}
          className='ms-1 flex h-7 cursor-pointer items-center gap-1 rounded-[7px] border border-[#3366E0]/30 bg-[#EEF3FD] px-2.5 text-xs font-medium text-[#3366E0] hover:bg-[#E2EAFB]'
        >
          <Plus className='size-3.5' /> Crear nuevo servicio
        </button>
      }
      first={
        isLoading ? <Empty>Cargando servicios…</Empty>
          : !categories.length ? <Empty>No hay servicios en el catálogo.</Empty>
          : <div className={ TILE_GRID }>
              { categories.map(({ category, templates }) =>
                <CategoryTile
                  key={ category.id }
                  name={ category.name }
                  icon={ category.icon }
                  detail={ count(templates.length, 'servicio') }
                  picked={ pickedIn(templates) }
                  onOpen={() => setOpenId(category.id)}
                />
              )}
            </div>
      }
      second={
        found
          ? found.length
            ? <div className={ CARD_COLUMNS }>
                { found.map(leaf => <ServiceCard key={ leaf.id } template={ leaf } picked={ picked } onToggle={ onToggle } group={ groupOf(leaf) } />) }
              </div>
            : <Empty>Ningún servicio coincide con la búsqueda.</Empty>
          : open &&
            <div className={ CARD_COLUMNS }>
              { open.templates.map(template => <ServiceCard key={ template.id } template={ template } picked={ picked } onToggle={ onToggle } />) }
            </div>
      }
    />
  )
}

export default ServiceCatalogue
