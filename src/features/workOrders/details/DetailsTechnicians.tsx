import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Technician } from '@/features/users/types'
import type { WorkOrder } from '@/features/workOrders/types'
import TechnicianAvatar from '@/features/workOrders/timeline/TechnicianAvatar'
import TechnicianPicker, { type Candidate } from '@/features/workOrders/details/TechnicianPicker'

type DetailsTechniciansProps = {
  order: WorkOrder
  candidates: Candidate[]                           // the technicians it does not have yet
  onChange: (technicians: Technician[]) => void     // the first leads, the rest support
}

/*
 * Who works on the order: the lead first, then support. Technicians join from the picker as
 * support, any of them can be made the lead, and a scheduled order keeps one at least
 */
const DetailsTechnicians = ({ order, candidates, onChange }: DetailsTechniciansProps) => {
  const [ picking, setPicking ] = useState(false)
  const technicians = order.technicians ?? []
  const removable = !order.scheduledAt || technicians.length > 1

  const add = (technician: Technician) => {
    onChange([ ...technicians, technician ])
    setPicking(false)
  }

  const lead = (technician: Technician) => onChange([ technician, ...technicians.filter(({ id }) => id !== technician.id) ])
  const remove = (technician: Technician) => onChange(technicians.filter(({ id }) => id !== technician.id))

  return (
    <section aria-label='Técnicos' className='flex flex-col gap-2.5 border-b border-[#E3E0DC] px-5 py-4'>
      <div className='flex items-center gap-2'>
        <h3 className='text-sm font-semibold'>Técnicos</h3>
        <span className='text-xs text-[#78716C]'>{ technicians.length }</span>
        <span className='flex-1' />
        <button
          type='button'
          aria-expanded={ picking }
          onClick={() => setPicking(!picking)}
          className={ cn('h-7 cursor-pointer rounded-[7px] border border-[#D6D3CF] px-2.5 text-xs font-medium',
            picking ? 'bg-[#F1EFEC]' : 'hover:bg-[#F5F5F4]') }
        >
          + Añadir técnico
        </button>
      </div>

      { picking && <TechnicianPicker candidates={ candidates } onPick={ add } /> }

      { technicians.length === 0
        ? <p className='text-[13px] text-[#78716C]'>Sin técnico asignado.</p>
        : <ul>
            { technicians.map((technician, index) =>
              <li key={ technician.id } className='flex items-center gap-2.5 border-b border-[#F1EFEC] py-2 last:border-b-0'>
                <TechnicianAvatar technician={ technician } size='md' />

                <div className='flex min-w-0 flex-1 flex-col'>
                  <span className='truncate text-sm font-medium'>{ technician.fullName }</span>
                  <span className='text-xs text-[#78716C]'>{ index === 0 ? 'Responsable' : 'Apoyo' }</span>
                </div>

                { index > 0 &&
                  <button
                    type='button'
                    onClick={() => lead(technician)}
                    className='cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-[#3366E0] hover:bg-[#EEF2FC]'
                  >
                    Hacer responsable
                  </button>
                }

                { removable &&
                  <button
                    type='button'
                    aria-label={ `Quitar a ${technician.fullName}` }
                    onClick={() => remove(technician)}
                    className='grid size-7 cursor-pointer place-content-center rounded-md text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#B42318]'
                  >
                    <X className='size-4' />
                  </button>
                }
              </li>
            )}
          </ul>
      }
    </section>
  )
}

export default DetailsTechnicians
