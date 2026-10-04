import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkOrder } from '@/features/workOrders/types'
import { blockStatus } from '@/features/workOrders/timeline/func/planner'
import { MONO, TIMELINE_STATUS_STYLE } from '@/features/workOrders/timeline/util/styles'

type PillStatus = keyof typeof TIMELINE_STATUS_STYLE

const PILL: Record<PillStatus, string> = {
  done: 'bg-[#E7E5E2] text-[#44403C]',
  live: 'bg-[#3366E0] text-white',
  todo: 'bg-[#E7E5E4] text-[#1C1917]',
  pause: 'bg-[#F6DDA6] text-[#6B3F02]',
}

/* The order's status as the timeline tells it: archived ones are done, those waiting for a technician pending */
const pillStatus = (order: WorkOrder): PillStatus =>
  order.status === 'paused' ? 'pause'
    : order.status === 'archived' ? 'done'
    : blockStatus(order) ?? 'todo'

/* The order's number and status, what it is, and the vehicle it is for */
const DetailsHeader = ({ order, onClose }: { order: WorkOrder, onClose: () => void }) => {
  const status = pillStatus(order)
  const vehicle = order.vehicle && [ order.vehicle.plateNumber, [ order.vehicle.make, order.vehicle.model ].filter(Boolean).join(' ') ]
    .filter(Boolean).join(' · ')

  return (
    <header className='flex flex-col gap-1.5 border-b border-[#E3E0DC] px-5 pt-[18px] pb-4'>
      <div className='flex items-center gap-2'>
        <span className={ `${MONO} text-xs font-medium text-[#78716C]` }>{ order.number }</span>
        <span className={ cn('rounded-[10px] px-2 py-0.5 text-[11px] font-medium', PILL[status]) }>
          { TIMELINE_STATUS_STYLE[status].label }
        </span>
        <span className='flex-1' />
        <button type='button' aria-label='Cerrar detalles' className='cursor-pointer ps-2 pb-2' onClick={ onClose }>
          <X className='size-5 text-gray-400' />
        </button>
      </div>

      <h2 className='text-xl font-semibold tracking-[-0.01em] text-pretty'>{ order.name }</h2>
      { vehicle && <p className='text-[13px] text-[#57534E]'>{ vehicle }</p> }
    </header>
  )
}

export default DetailsHeader
