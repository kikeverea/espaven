import { cn } from '@/lib/utils'
import type { WorkOrder } from '@/features/workOrders/types'
import { duration } from '@/features/workOrders/timeline/func/timeline'
import { ROW_HEIGHT } from '@/features/workOrders/timeline/util/layout'
import { blockLayout, isThin, subline } from '@/features/workOrders/timeline/grid/blockText'
import BlockLabel from '@/features/workOrders/timeline/grid/BlockLabel'
import { LANES } from '@/features/workOrders/timeline/lanes/lanes'
import type { LaneType } from '@/features/workOrders/timeline/util/types'
import useDrag from '@/features/workOrders/timeline/hooks/useDrag.tsx'

type LaneCardProps = {
  order: WorkOrder
  laneType: LaneType
  ppm: number             // px a minute
  dimmed: boolean
  onSelect?: (id: WorkOrder['id']) => void
  onHover: (rect: DOMRect | null) => void
}

const LaneCard = ({ order, laneType, ppm, dimmed, onSelect, onHover }: LaneCardProps) => {
  const lane = LANES[laneType]
  const width = order.labourMinutes * ppm - 4
  const thin = isThin(width)

  const { startDrag, endDrag } = useDrag()

  return (
    <button
      type='button'
      draggable
      onDragStart={ startDrag(order, laneType) }
      onDragEnd={ endDrag }
      onClick={() => onSelect?.(order.id)}
      onMouseEnter={ event => onHover(event.currentTarget.getBoundingClientRect()) }
      onMouseLeave={() => onHover(null)}
      className={ cn(
        'flex shrink-0 cursor-grab flex-col justify-center gap-0.5 overflow-hidden rounded-[7px] border text-left transition-[border-color,box-shadow,opacity] focus-visible:outline-2 focus-visible:outline-[#3366E0]',
        blockLayout(thin),
        lane.card,
        dimmed && 'opacity-35'
      )}
      style={{ width, height: ROW_HEIGHT - 20 }}
    >
      <BlockLabel
        title={ order.name }
        sub={ subline(order, duration(order.labourMinutes), thin) }
        titleClass={ lane.cardTitle }
        subClass={ lane.sub }
      />
    </button>
  )
}

export default LaneCard
