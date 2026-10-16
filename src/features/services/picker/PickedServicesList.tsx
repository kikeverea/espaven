import { X } from 'lucide-react'
import type { DraftService, PickedService } from '@/features/services/picker/types'
import type { InventoryItem } from '@/features/inventory/inventoryItems/types'
import { count, hours } from '@/features/services/picker/hours'
import { itemsOf, nameOf } from '@/features/services/picker/picked'

type PickedServicesListProps = {
  services: PickedService[]
  draft: DraftService | null
  onRemove: (service: PickedService) => void
  onDropDraftItem: (item: InventoryItem) => void
  onBack: () => void
  onSave: () => void
  saving: boolean
  canSave: boolean                // there is something to save
  saveLabel: string               // 'Crear orden' for an order yet to be, 'Guardar cambios' for one that is
}

/* The service being made, at the top: its items as chips, to drop */
const Draft = ({ draft, onDropItem }: { draft: DraftService, onDropItem: (item: InventoryItem) => void }) =>
  <li aria-label='Servicio en preparación' className='flex flex-col gap-2 rounded-[9px] border border-dashed border-[#3366E0]/60 bg-[#F3F6FE] p-3'>
    <div className='flex items-baseline gap-2'>
      <span className='min-w-0 flex-1 truncate text-sm font-medium'>{ draft.name.trim() || 'Nuevo servicio' }</span>
      <span className='text-xs tabular-nums text-[#57534E]'>{ hours(draft.labourMinutes) }</span>
    </div>
    { draft.items.length > 0 &&
      <ul aria-label='Artículos del nuevo servicio' className='flex flex-wrap gap-1.5'>
        { draft.items.map(item =>
          <li key={ item.id } className='flex items-center gap-1 rounded-full border border-[#DCD9D5] bg-white py-0.5 ps-2.5 pe-1 text-xs'>
            { item.name }
            <button type='button' aria-label={ `Quitar ${item.name}` } onClick={() => onDropItem(item)} className='grid size-4 cursor-pointer place-content-center rounded-full text-[#78716C] hover:bg-[#F1EFEC]'>
              <X className='size-3' />
            </button>
          </li>
        )}
      </ul>
    }
  </li>

/* The services the order is taking on, as they are picked: what they add up to, and saving the order with them */
const PickedServicesList = ({ services, draft, onRemove, onDropDraftItem, onBack, onSave, saving, canSave, saveLabel }: PickedServicesListProps) => {
  const labour = services.reduce((minutes, service) => minutes + service.labourMinutes, 0)
  const items = services.reduce((total, service) => total + itemsOf(service), 0)

  return (
    <aside aria-label='Servicios de la orden' className='flex flex-col gap-3'>
      <header className='flex items-center gap-2'>
        <h2 className='text-[15px] font-semibold'>Servicios de la orden</h2>
        <span className='grid h-5 min-w-5 place-content-center rounded-full bg-[#ECEAE6] px-1.5 text-[11px] font-medium text-[#57534E]'>{ services.length }</span>
      </header>

      <ul className='flex max-h-[55vh] flex-col gap-2 overflow-y-auto'>
        { draft && <Draft draft={ draft } onDropItem={ onDropDraftItem } /> }

        { !services.length && !draft &&
          <li className='px-1 py-4 text-center text-[13px] text-[#78716C]'>Elige servicios de una categoría o crea uno nuevo.</li>
        }

        { services.map(service =>
          <li key={ service.key } className='flex items-center gap-2 rounded-[9px] border border-[#E3E0DC] bg-white px-3 py-2.5'>
            <div className='flex min-w-0 flex-1 flex-col'>
              <div className='flex items-center gap-1.5'>
                <span className='truncate text-sm font-medium'>{ nameOf(service) }</span>
                { service.kind === 'new' &&
                  <span className='shrink-0 rounded-[6px] bg-[#EEF3FD] px-1.5 py-px text-[10px] font-semibold text-[#3366E0] uppercase'>Nuevo</span>
                }
              </div>
              <span className='text-xs tabular-nums text-[#78716C]'>
                { [ hours(service.labourMinutes), itemsOf(service) > 0 && count(itemsOf(service), 'artículo') ].filter(Boolean).join(' · ') }
              </span>
            </div>
            <button
              type='button'
              aria-label={ `Quitar ${nameOf(service)}` }
              onClick={() => onRemove(service)}
              className='grid size-7 shrink-0 cursor-pointer place-content-center rounded-md text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#B42318]'
            >
              <X className='size-4' />
            </button>
          </li>
        )}
      </ul>

      <footer className='flex flex-col gap-3 border-t border-[#E3E0DC] pt-3'>
        <dl className='flex flex-col gap-1.5 text-[13px]'>
          <div className='flex justify-between'>
            <dt className='text-[#57534E]'>Mano de obra</dt>
            <dd className='font-semibold tabular-nums'>{ hours(labour) }</dd>
          </div>
          <div className='flex justify-between'>
            <dt className='text-[#57534E]'>Artículos</dt>
            <dd className='font-semibold tabular-nums'>{ items }</dd>
          </div>
        </dl>
        <div className='flex gap-2'>
          <button type='button' onClick={ onBack } className='h-10 flex-1 cursor-pointer rounded-[8px] border border-[#D6D3CF] bg-white text-sm font-medium hover:bg-[#F5F5F4]'>
            Volver
          </button>
          <button
            type='button'
            disabled={ !canSave || saving }
            onClick={ onSave }
            className='h-10 flex-[2] cursor-pointer rounded-[8px] bg-[#3366E0] text-sm font-medium text-white hover:bg-[#2A57C4] disabled:cursor-not-allowed disabled:bg-[#E7E5E2] disabled:text-[#A8A29E]'
          >
            { saving ? 'Guardando…' : saveLabel }
          </button>
        </div>
      </footer>
    </aside>
  )
}

export default PickedServicesList
