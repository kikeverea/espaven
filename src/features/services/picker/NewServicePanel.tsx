import { useInventoryCategories } from '@/features/inventoryCategories/useInventoryCategories'
import type { DraftService } from '@/features/services/picker/types'
import { isReady } from '@/features/services/picker/picked'
import HoursStepper from '@/features/services/picker/HoursStepper'

type NewServicePanelProps = {
  draft: DraftService
  onChange: (draft: DraftService) => void
  onAdd: () => void
  onCancel: () => void
}

const FIELD_LABEL = 'text-[11px] font-medium tracking-[.06em] text-[#78716C] uppercase'
const INPUT = 'h-9 rounded-[7px] border border-[#D6D3CF] bg-white px-2.5 text-sm outline-none focus:border-[#3366E0]'

/*
 * A service made for the order: its name and hours, and whether it is kept as a template for
 * the orders to come, in a category. Its items are picked from the inventory below
 */
const NewServicePanel = ({ draft, onChange, onAdd, onCancel }: NewServicePanelProps) => {
  const { data: categories } = useInventoryCategories()
  const set = (fields: Partial<DraftService>) => onChange({ ...draft, ...fields })

  return (
    <section aria-label='Nuevo servicio' className='flex flex-col gap-3.5 rounded-[12px] border border-[#3366E0]/30 bg-[#EEF3FD] p-4'>
      <div className='flex flex-wrap items-end gap-4'>
        <label className='flex min-w-[220px] flex-1 flex-col gap-1.5'>
          <span className={ FIELD_LABEL }>Nombre del servicio</span>
          <input
            autoFocus
            value={ draft.name }
            onChange={ event => set({ name: event.target.value }) }
            placeholder='Ej. Cambio de amortiguadores'
            className={ INPUT }
          />
        </label>
        <div className='flex flex-col gap-1.5'>
          <span className={ FIELD_LABEL }>Mano de obra</span>
          <HoursStepper minutes={ draft.labourMinutes } onChange={ labourMinutes => set({ labourMinutes }) } />
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
        <label className='flex cursor-pointer items-center gap-2 text-sm'>
          <input
            type='checkbox'
            checked={ draft.saveAsTemplate }
            onChange={ event => set({ saveAsTemplate: event.target.checked }) }
            className='size-4 cursor-pointer accent-[#3366E0]'
          />
          Guardar como plantilla para futuras órdenes
        </label>

        { draft.saveAsTemplate &&
          <select
            aria-label='Categoría de la plantilla'
            value={ draft.inventoryCategory?.id ?? '' }
            onChange={ event => set({ inventoryCategory: categories?.collection.find(({ id }) => id === Number(event.target.value)) }) }
            className={ `${INPUT} h-8 pe-7` }
          >
            <option value='' disabled>Elige una categoría</option>
            { categories?.collection.map(category => <option key={ category.id } value={ category.id }>{ category.name }</option>) }
          </select>
        }
      </div>

      <div className='flex items-center justify-between gap-2'>
        <span className='text-xs text-[#57534E]'>
          { draft.items.length ? 'Sus artículos se añaden desde el inventario.' : 'Elige sus artículos en el inventario, si usa alguno.' }
        </span>
        <div className='flex gap-2'>
          <button type='button' onClick={ onCancel } className='h-9 cursor-pointer rounded-[8px] px-3 text-sm font-medium text-[#57534E] hover:bg-white/60'>
            Cancelar
          </button>
          <button
            type='button'
            disabled={ !isReady(draft) }
            onClick={ onAdd }
            className='h-9 cursor-pointer rounded-[8px] bg-[#3366E0] px-3.5 text-sm font-medium text-white hover:bg-[#2A57C4] disabled:cursor-not-allowed disabled:bg-[#E7E5E2] disabled:text-[#A8A29E]'
          >
            Añadir a la orden
          </button>
        </div>
      </div>
    </section>
  )
}

export default NewServicePanel
