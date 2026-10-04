import { createPortal } from 'react-dom'
import type { WorkOrder } from '@/features/workOrders/types'
import { statusLabels } from '@/features/workOrders/status'
import { duration } from '@/features/workOrders/timeline/func/timeline'
import { spanOf } from '@/features/workOrders/timeline/func/planner'
import { FONT, MONO } from '@/features/workOrders/timeline/util/styles'
import { cn } from '@/lib/utils'
import { clock } from '@/lib/time.ts'

const WIDTH = 250
const HEIGHT = 140        // about, to flip it above a block near the bottom of the screen
const GAP = 8

/* The whole of a block, which only has room for its title: below its bottom-left, kept on screen */
const TimelineTooltip = ({ order, anchor }: { order: WorkOrder, anchor: DOMRect }) => {
  /* orders in the lanes have no time yet */
  const span = order.scheduledAt ? spanOf(order) : null
  const vehicle = order.vehicle && [ order.vehicle.plateNumber, [ order.vehicle.make, order.vehicle.model ].filter(Boolean).join(' ') ]
    .filter(Boolean).join(' · ')

  const left = Math.min(Math.max(anchor.left, GAP), window.innerWidth - WIDTH - GAP)
  const top = anchor.bottom + GAP + HEIGHT > window.innerHeight
    ? anchor.top - GAP - HEIGHT
    : anchor.bottom + GAP

  return createPortal(
    <div
      role='tooltip'
      className={ cn(FONT, 'pointer-events-none fixed z-50 flex flex-col gap-1 rounded-[10px] bg-stone-900 px-3.5 py-3 text-white shadow-[0_8px_24px_rgba(0,0,0,.18)]') }
      style={{ left, top, width: WIDTH }}
    >
      <span className='flex items-center justify-between gap-2'>
        <span className={ cn(MONO, 'text-[11px] text-stone-400') }>{ order.number }</span>
        <span className='rounded-[10px] bg-white/12 px-2 py-px text-[11px] font-medium'>{ statusLabels[order.status] }</span>
      </span>

      <span className='text-sm font-semibold leading-snug'>{ order.name }</span>
      { vehicle && <span className='text-xs text-white/75'>{ vehicle }</span> }

      <span className={ cn(MONO, 'text-[11px] text-white/75') }>
        { span ? `${clock(span.start)} – ${clock(span.end)}` : 'Sin hora' } · { duration(order.labourMinutes) }
      </span>
    </div>,
    document.body
  )
}

export default TimelineTooltip
