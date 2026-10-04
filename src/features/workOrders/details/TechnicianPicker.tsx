import { cn } from '@/lib/utils'
import type { Technician } from '@/features/users/types'
import type { Availability } from '@/features/workOrders/timeline/util/types'
import TechnicianAvatar from '@/features/workOrders/timeline/TechnicianAvatar'
import { clock } from '@/lib/time'

export type Candidate = { technician: Technician, availability: Availability }

/* Whether they could join: free at the order's time, busy then and with what, or the order has no time */
const availabilityLabel = (availability: Availability) => {
  if (!availability.span)
    return { text: 'Orden sin hora asignada', tone: 'text-[#78716C]' }

  const { start, end } = availability.span

  return availability.free
    ? { text: `Libre ${clock(start)} – ${clock(end)}`, tone: 'text-[#1E7A46]' }
    : { text: `Ocupado · ${availability.title} ${clock(start)}–${clock(end)}`, tone: 'text-[#B42318]' }
}

/* The technicians the order does not have yet, each with whether they are free at its time */
const TechnicianPicker = ({ candidates, onPick }: { candidates: Candidate[], onPick: (technician: Technician) => void }) =>
  <div className='overflow-hidden rounded-[9px] border border-[#D6D3CF] shadow-[0_4px_12px_rgba(28,25,23,.06)]'>
    { candidates.length === 0 &&
      <p className='px-3 py-[9px] text-[13px] text-[#78716C]'>Todos los técnicos están asignados.</p>
    }

    { candidates.map(({ technician, availability }) => {
      const { text, tone } = availabilityLabel(availability)

      return (
        <button
          key={ technician.id }
          type='button'
          disabled={ !availability.free }
          onClick={() => onPick(technician)}
          className='flex w-full cursor-pointer items-center gap-2.5 border-b border-[#EFEDEB] px-3 py-[9px] text-left last:border-b-0 hover:bg-[#F7F6F4] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent'
        >
          <TechnicianAvatar technician={ technician } size='sm' />
          <span className='shrink-0 text-[13px] font-medium'>{ technician.fullName }</span>
          <span className={ cn('min-w-0 flex-1 truncate text-right text-xs', tone) }>{ text }</span>
        </button>
      )
    })}
  </div>

export default TechnicianPicker
