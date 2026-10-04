import { useEffect, useRef, useState } from 'react'
import { isToday } from 'date-fns'
import { cn } from '@/lib/utils.ts'
import type { Technician } from '@/features/users/types.ts'
import type { WorkOrder } from '@/features/workOrders/types.ts'
import type { ScheduleUnavailability } from '@/features/unavailabilities/types.ts'
import { END, offsetOf, pxPerMinute, START, trackWidth } from '@/features/workOrders/timeline/func/timeline.ts'
import { ordersOf, technicianRows, unavailableSpans } from '@/features/workOrders/timeline/func/planner.ts'
import { NAME_COLUMN } from '@/features/workOrders/timeline/util/layout.ts'
import { SCROLLBAR } from '@/features/workOrders/timeline/util/styles.ts'
import { useNow } from '@/hooks/useNow.ts'
import { useVisibleWidth } from '@/features/workOrders/timeline/grid/useVisibleWidth.ts'
import TimelineToolbar, { type TimelineCounts } from '@/features/workOrders/timeline/toolbar/TimelineToolbar.tsx'
import TimeHeader from '@/features/workOrders/timeline/grid/TimeHeader.tsx'
import TechnicianRow from '@/features/workOrders/timeline/grid/TechnicianRow.tsx'
import Lanes from '@/features/workOrders/timeline/lanes/Lanes.tsx'
import TimelineTooltip from '@/features/workOrders/timeline/TimelineTooltip.tsx'
import type { Zoom } from '@/features/workOrders/timeline/util/types'
import useDrag from '@/features/workOrders/timeline/hooks/useDrag'
import { minuteOfDay } from '@/lib/time.ts'

type TimelineGridProps = {
  day: Date
  zoom: Zoom
  technicians: Technician[]
  plan: { scheduled: WorkOrder[], unscheduled: WorkOrder[], paused: WorkOrder[] }
  counts: TimelineCounts
  unavailabilities: ScheduleUnavailability[]
  onDayChange: (day: Date) => void
  onZoomChange: (zoom: Zoom) => void
  onSelect?: (id: WorkOrder['id']) => void
}

const TimelineGrid = (props: TimelineGridProps) => {
  const { day, zoom, technicians, plan, unavailabilities } = props
  const { drag } = useDrag()

  const now = useNow()
  const scroller = useRef<HTMLDivElement>(null)
  const visibleWidth = useVisibleWidth(scroller)
  const [ hovered, setHovered ] = useState<{ order: WorkOrder, rect: DOMRect } | null>(null)

  /* the zoom's density, stretched to fill the card when the day would not */
  const ppm = pxPerMinute(zoom, visibleWidth - NAME_COLUMN)
  const width = trackWidth(ppm)
  const rows = technicianRows(technicians, plan.scheduled)
  const nowMinute = isToday(day) && minuteOfDay(now) >= START && minuteOfDay(now) <= END ? minuteOfDay(now) : null

  /* the lanes' cards wrap within the part of the track that shows. Unmeasured, the whole track */
  const laneWidth = visibleWidth ? Math.min(width, visibleWidth - NAME_COLUMN) : width

  useEffect(() => {
    if (scroller.current && isToday(day))
      scroller.current.scrollLeft = Math.max(offsetOf(minuteOfDay(new Date()) - 150, ppm), 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hover = (order: WorkOrder, rect: DOMRect | null) => setHovered(rect ? { order, rect } : null)

  /* a drag takes the tooltip away, so it does not come back where the card was once dropped */
  if (drag && hovered)
    setHovered(null)

  return (
    <section className='overflow-hidden rounded-xl border border-[#D6D3CF] bg-white shadow-[0_1px_2px_rgba(28,25,23,.05)]'>
      <TimelineToolbar
        day={ day }
        zoom={ zoom }
        counts={ props.counts }
        onDayChange={ props.onDayChange }
        onZoomChange={ props.onZoomChange }
      />

      <div ref={ scroller } className={ cn('max-h-[calc(100vh-150px)] overflow-auto', SCROLLBAR) }>
        <div style={{ width: NAME_COLUMN + width }}>
          <TimeHeader zoom={ zoom } ppm={ ppm } now={ nowMinute } />

          <div className='relative'>
            { rows.length === 0 &&
              <p className='px-4 py-10 text-center text-sm text-[#78716C]'>
                No hay técnicos
              </p>
            }

            { rows.map(technician =>
              <TechnicianRow
                key={ technician.id }
                technician={ technician }
                ppm={ ppm }
                orders={ ordersOf(technician, plan.scheduled) }
                unavailable={ unavailableSpans(unavailabilities, technician.id, day) }
                onSelect={ props.onSelect }
                onHover={ hover }
              />
            )}

            { nowMinute != null && rows.length > 0 &&
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-y-0 z-[4] w-0.5 -translate-x-1/2 bg-[#E5484D]'
                style={{ left: NAME_COLUMN + offsetOf(nowMinute, ppm) }}
              />
            }
          </div>

          <Lanes
            unscheduled={ plan.unscheduled }
            paused={ plan.paused }
            ppm={ ppm }
            width={ laneWidth }
            onSelect={ props.onSelect }
            onHover={ hover }
          />
        </div>
      </div>

      { hovered && !drag && <TimelineTooltip order={ hovered.order } anchor={ hovered.rect } /> }
    </section>
  )
}

export default TimelineGrid
