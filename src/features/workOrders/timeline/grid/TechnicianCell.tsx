import { cn } from '@/lib/utils.ts'
import type { Technician } from '@/features/users/types.ts'
import { loadTone, shortDuration } from '@/features/workOrders/timeline/func/timeline.ts'
import { NAME_COLUMN } from '@/features/workOrders/timeline/util/layout.ts'

type TechnicianCellProps = {
  technician: Technician
  booked: number
  capacity: number
}

/* Initials on a tint of their own, so technicians tell apart at a glance */
const AVATAR_TINTS = [
  'bg-[#FDE7E4] text-[#B42318]',
  'bg-[#E6E8FD] text-[#3538CD]',
  'bg-[#E3F4EA] text-[#067647]',
  'bg-[#FDF0DC] text-[#B54708]',
  'bg-[#F0E6FD] text-[#6941C6]',
  'bg-[#DFF2FB] text-[#026AA2]',
]

const LOAD_COLOUR = { high: 'bg-[#E5484D]', mid: 'bg-[#D9930D]', low: 'bg-[#3366E0]' }

/* A technician, pinned left as the hours scroll by: who, and how booked their day is */
const TechnicianCell = ({ technician, booked, capacity }: TechnicianCellProps) => {
  const tint = AVATAR_TINTS[technician.id % AVATAR_TINTS.length]
  const initials = technician.fullName.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()

  return (
    <div
      className='sticky left-0 z-[5] flex shrink-0 items-center gap-3 border-r border-[#DCD9D5] bg-white px-[18px]'
      style={{ width: NAME_COLUMN }}
    >
      <span className={ cn('grid size-8 shrink-0 place-content-center rounded-full text-[13px] font-semibold', tint) }>
        { initials }
      </span>

      <div className='flex min-w-0 flex-1 flex-col gap-[5px]'>
        <p className='truncate text-sm leading-[1.2] font-medium'>{ technician.fullName }</p>
        <div className='flex items-center gap-2'>
          <div className='h-1 flex-1 overflow-hidden rounded-[2px] bg-[#E8E5E1]'>
            <div
              className={ cn('h-full rounded-[2px]', LOAD_COLOUR[loadTone(booked, capacity)]) }
              style={{ width: `${Math.min(capacity ? booked / capacity : 0, 1) * 100}%` }}
            />
          </div>
          <span className='shrink-0 text-[11px] whitespace-nowrap tabular-nums text-[#78716C]'>
            { shortDuration(booked) } / { shortDuration(capacity) }
          </span>
        </div>
      </div>
    </div>
  )
}

export default TechnicianCell
