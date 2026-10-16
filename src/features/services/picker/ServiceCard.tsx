import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ServiceTemplate } from '@/features/serviceTemplates/types'
import { isGroup, pickState, type PickState } from '@/features/services/picker/catalogue'
import { count, hours } from '@/features/services/picker/hours'
import TickBox from '@/features/services/picker/TickBox'

type ServiceCardProps = {
  template: ServiceTemplate
  picked: Set<ServiceTemplate['id']>
  onToggle: (templates: ServiceTemplate[], pick: boolean) => void
  group?: string                  // the group a child is in, when it shows apart from it: search results
}

/* Two columns that stay packed while a card opens */
export const CARD_COLUMNS = '[columns:2_280px] gap-2.5'

const leafMeta = (template: ServiceTemplate) =>
  [ hours(template.labourMinutes), template.items?.length && count(template.items.length, 'artículo') ].filter(Boolean).join(' · ')

const Row = ({ name, meta, state, onClick, className }: { name: string, meta: string, state: PickState, onClick: () => void, className?: string }) =>
  <button
    type='button'
    role='checkbox'
    aria-checked={ state === 'all' ? true : state === 'some' ? 'mixed' : false }
    aria-label={ name }
    onClick={ onClick }
    className={ cn('flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-2.5 text-left', className) }
  >
    <TickBox state={ state } />
    <span className='flex min-w-0 flex-col'>
      <span className='truncate text-sm font-medium'>{ name }</span>
      <span className='truncate text-xs text-[#78716C]'>{ meta }</span>
    </span>
  </button>

/*
 * A service to pick, thin. A group picks or drops all its children at once, and opens to pick
 * them one by one
 */
const ServiceCard = ({ template, picked, onToggle, group }: ServiceCardProps) => {
  const [ open, setOpen ] = useState(false)
  const state = pickState(template, picked)
  const selected = state !== 'none'

  const card = cn('mb-2.5 break-inside-avoid overflow-hidden rounded-[9px] border bg-white transition-colors',
    selected ? 'border-[#3366E0] bg-[#F3F6FE] shadow-[0_0_0_1px_#3366E0]' : 'border-[#DCD9D5] hover:border-[#C9C5C0]')

  if (!isGroup(template))
    return (
      <div className={ card }>
        <Row
          name={ template.name }
          meta={ group ? `${group} · ${leafMeta(template)}` : leafMeta(template) }
          state={ state }
          onClick={() => onToggle([ template ], state === 'none')}
        />
      </div>
    )

  const children = template.children!

  return (
    <div className={ card }>
      <div className='flex items-stretch'>
        <Row
          name={ template.name }
          meta={ `${count(children.length, 'servicio')} · ${hours(template.labourMinutes)}` }
          state={ state }
          onClick={() => onToggle(children, state !== 'all')}
        />
        <button
          type='button'
          aria-label={ `${open ? 'Cerrar' : 'Abrir'} ${template.name}` }
          aria-expanded={ open }
          onClick={() => setOpen(!open)}
          className='grid w-11 shrink-0 cursor-pointer place-content-center border-l border-[#E3E0DC] text-[#78716C] hover:bg-[#F5F5F4]'
        >
          <ChevronDown className={ cn('size-4 transition-transform', open && 'rotate-180') } />
        </button>
      </div>

      { open &&
        <ul aria-label={ template.name } className='border-t border-[#E3E0DC] bg-white'>
          { children.map(child =>
            <li key={ child.id } className='border-b border-[#F1EFEC] last:border-b-0'>
              <Row
                name={ child.name }
                meta={ leafMeta(child) }
                state={ picked.has(child.id) ? 'all' : 'none' }
                onClick={() => onToggle([ child ], !picked.has(child.id))}
                className='ps-7'
              />
            </li>
          )}
        </ul>
      }
    </div>
  )
}

export default ServiceCard
