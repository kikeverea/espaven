import type { ReactNode } from 'react'
import type { WorkOrder } from '@/features/workOrders/types'
import { duration } from '@/features/workOrders/timeline/func/timeline'
import { spanOf } from '@/features/workOrders/timeline/func/planner'
import { MONO } from '@/features/workOrders/timeline/util/styles'
import { clock } from '@/lib/time'

const Field = ({ label, children }: { label: string, children: ReactNode }) =>
  <div className='flex flex-col gap-1'>
    <span className='text-[11px] font-medium tracking-[.06em] text-[#78716C] uppercase'>{ label }</span>
    <span className={ `${MONO} text-sm font-medium` }>{ children }</span>
  </div>

/* When the order is on, if it has a time yet, and how long it takes */
const DetailsSchedule = ({ order }: { order: WorkOrder }) => {
  const span = order.scheduledAt ? spanOf(order) : null

  return (
    <section className='grid grid-cols-2 gap-3 border-b border-[#E3E0DC] px-5 py-4'>
      <Field label='Horario'>{ span ? `${clock(span.start)} – ${clock(span.end)}` : 'Sin hora' }</Field>
      <Field label='Duración'>{ duration(order.labourMinutes) }</Field>
    </section>
  )
}

export default DetailsSchedule
