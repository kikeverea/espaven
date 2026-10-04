import { cn } from '@/lib/utils.ts'
import type { Technician } from '@/features/users/types.ts'
import { loadTone, shortDuration } from '@/features/workOrders/timeline/func/timeline.ts'
import { NAME_COLUMN } from '@/features/workOrders/timeline/util/layout.ts'
import TechnicianAvatar from '@/features/workOrders/timeline/TechnicianAvatar.tsx'

type TechnicianCellProps = {
  technician: Technician
  booked: number
  capacity: number
}

const LOAD_COLOUR = { high: 'bg-[#E5484D]', mid: 'bg-[#D9930D]', low: 'bg-[#3366E0]' }

/* A technician, pinned left as the hours scroll by: who, and how booked their day is */
const TechnicianCell = ({ technician, booked, capacity }: TechnicianCellProps) => {
  return (
    <div
      className='sticky left-0 z-[5] flex shrink-0 items-center gap-3 border-r border-[#DCD9D5] bg-white px-[18px]'
      style={{ width: NAME_COLUMN }}
    >
      <TechnicianAvatar technician={ technician } size='lg' />

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
