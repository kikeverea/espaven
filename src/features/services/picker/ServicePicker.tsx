import { useState } from 'react'
import { Search, X } from 'lucide-react'
import type { ServiceTemplate } from '@/features/serviceTemplates/types'
import type { InventoryItem } from '@/features/inventory/inventoryItems/types'
import type { DraftService } from '@/features/services/picker/types'
import { newDraft } from '@/features/services/picker/picked'
import ServiceCatalogue from '@/features/services/picker/ServiceCatalogue'
import InventoryBrowser from '@/features/services/picker/InventoryBrowser'
import NewServicePanel from '@/features/services/picker/NewServicePanel'

type ServicePickerProps = {
  templates: ServiceTemplate[]
  isLoading: boolean
  picked: Set<ServiceTemplate['id']>
  onToggle: (templates: ServiceTemplate[], pick: boolean) => void
  draft: DraftService | null              // a service being made: the inventory shows instead of the catalogue
  onDraftChange: (draft: DraftService | null) => void
  onAddDraft: () => void
}

/*
 * Services for an order: picked from the catalogue, or made there and then out of the inventory.
 * The search looks through whichever shows
 */
const ServicePicker = ({ templates, isLoading, picked, onToggle, draft, onDraftChange, onAddDraft }: ServicePickerProps) => {
  const [ search, setSearch ] = useState('')

  const draftWith = (draft: DraftService | null) => {
    setSearch('')
    onDraftChange(draft)
  }

  const toggleItem = (item: InventoryItem) => draft && onDraftChange({
    ...draft,
    items: draft.items.some(({ id }) => id === item.id)
      ? draft.items.filter(({ id }) => id !== item.id)
      : [ ...draft.items, item ],
  })

  return (
    <div className='flex min-w-0 flex-col gap-4'>
      <div className='relative'>
        <Search aria-hidden className='pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-[#78716C]' />
        <input
          type='search'
          aria-label={ draft ? 'Buscar en el inventario' : 'Buscar servicios' }
          placeholder={ draft ? 'Buscar artículos por nombre o referencia…' : 'Buscar servicios…' }
          value={ search }
          onChange={ event => setSearch(event.target.value) }
          className='h-[46px] w-full rounded-[10px] border border-[#DCD9D5] bg-white ps-11 pe-10 text-[15px] outline-none focus:border-[#3366E0] [&::-webkit-search-cancel-button]:hidden'
        />
        { search &&
          <button type='button' aria-label='Borrar búsqueda' onClick={() => setSearch('')} className='absolute top-1/2 right-3 grid size-6 -translate-y-1/2 cursor-pointer place-content-center rounded text-[#78716C] hover:bg-[#F1EFEC]'>
            <X className='size-3.5' />
          </button>
        }
      </div>

      { draft
        ? <>
            <NewServicePanel draft={ draft } onChange={ onDraftChange } onAdd={() => { setSearch(''); onAddDraft() }} onCancel={() => draftWith(null)} />
            <InventoryBrowser search={ search } picked={ draft.items } onToggle={ toggleItem } />
          </>
        : <ServiceCatalogue
            templates={ templates }
            isLoading={ isLoading }
            search={ search }
            picked={ picked }
            onToggle={ onToggle }
            onCreate={ category => draftWith(newDraft(category)) }
          />
      }
    </div>
  )
}

export default ServicePicker
