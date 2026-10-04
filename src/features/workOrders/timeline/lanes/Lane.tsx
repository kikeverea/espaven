import { cn } from '@/lib/utils'
import type { WorkOrder } from '@/features/workOrders/types'
import { trackWidth } from '@/features/workOrders/timeline/func/timeline'
import { NAME_COLUMN } from '@/features/workOrders/timeline/util/layout'
import { LANES } from '@/features/workOrders/timeline/lanes/lanes'
import type { LaneType } from '@/features/workOrders/timeline/util/types'
import useDrag from '@/features/workOrders/timeline/hooks/useDrag'
import LaneCard from '@/features/workOrders/timeline/lanes/LaneCard'

type LaneProps = {
  laneType: LaneType
  orders: WorkOrder[]
  ppm: number             // px a minute
  width: number           // of the timeline that shows, for the cards to wrap within
  onSelect?: (id: WorkOrder['id']) => void
  onHover: (order: WorkOrder, rect: DOMRect | null) => void
}

const Lane = ({ laneType, orders, ppm, width, ...props }: LaneProps) => {
  const lane = LANES[laneType]
  const { drag, overLane, dragOverLane, leaveLane, dropOnLane } = useDrag()
  const highlighted = overLane === laneType

  return (
    <section
      aria-label={ lane.title }
      className='flex border-t border-[#DCD9D5]'
      onDragOver={ dragOverLane(laneType) }
      onDragLeave={ leaveLane }
      onDrop={ dropOnLane(laneType) }
    >
      <div
        className='flex items-center sticky left-0 z-2 shrink-0 border-r border-[#DCD9D5] bg-white px-4.5 py-3.5'
        style={{ width: NAME_COLUMN }}
      >
        <h3 className='text-sm font-medium'>
          { lane.title }
          <span className={ cn('rounded-[10px] px-2 py-px text-xs font-medium tabular-nums ms-2', lane.badge) }>
            { orders.length }
          </span>
        </h3>
      </div>

      <div className='shrink-0 transition-colors' style={{ width: trackWidth(ppm), background: highlighted ? lane.dropTrack : lane.track }}>
        <div className='sticky flex flex-wrap items-start gap-2 p-3' style={{ left: NAME_COLUMN, width }}>
          { orders.length === 0
            ? <p className='py-2 text-[13px] text-[#78716C]'>{ lane.empty }</p>
            : orders.map(order =>
              <LaneCard
                key={ order.id }
                order={ order }
                laneType={ laneType }
                ppm={ ppm }
                dimmed={ drag?.order.id === order.id }
                onSelect={ props.onSelect }
                onHover={ rect => props.onHover(order, rect) }
              />
            )
          }
        </div>
      </div>
    </section>
  )
}

export default Lane
