import type { DragEvent } from 'react'
import { cn } from '@/lib/utils.ts'
import type { WorkOrder } from '@/features/workOrders/types.ts'
import { blockGeometry } from '@/features/workOrders/timeline/func/timeline.ts'
import { blockStatus, spanOf } from '@/features/workOrders/timeline/func/planner.ts'
import { TIMELINE_STATUS_STYLE } from '@/features/workOrders/timeline/util/styles.ts'
import { BLOCK_INSET } from '@/features/workOrders/timeline/util/layout.ts'
import { blockLayout, isThin, subline } from '@/features/workOrders/timeline/grid/blockText.ts'
import BlockLabel from '@/features/workOrders/timeline/grid/BlockLabel.tsx'

type BlockProps = {
  order: WorkOrder
  ppm: number             // px a minute
  dimmed: boolean
  onSelect?: (id: WorkOrder['id']) => void
  onDragStart: (event: DragEvent<HTMLElement>) => void
  onDragEnd: () => void
  onHover: (rect: DOMRect | null) => void
}

/* A scheduled order on its technician's row, as wide as it lasts. Completed ones stay where they are */
const Block = ({ order, ppm, dimmed, onSelect, onDragStart, onDragEnd, onHover }: BlockProps) => {
  const status = blockStatus(order)!
  const geometry = blockGeometry(spanOf(order), ppm)

  if (!geometry)
    return null

  const style = TIMELINE_STATUS_STYLE[status]
  const thin = isThin(geometry.width)

  return (
    <button
      type='button'
      draggable={ status !== 'done' }
      onDragStart={ onDragStart }
      onDragEnd={ onDragEnd }
      onClick={() => onSelect?.(order.id)}
      onMouseEnter={ event => onHover(event.currentTarget.getBoundingClientRect()) }
      onMouseLeave={() => onHover(null)}
      className={ cn(
        'absolute z-[2] flex flex-col justify-center gap-0.5 overflow-hidden rounded-[7px] border text-left transition-opacity focus-visible:outline-2 focus-visible:outline-[#3366E0]',
        blockLayout(thin),
        style.card,
        status === 'done' ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing',
        dimmed && 'opacity-35'
      )}
      style={{ left: geometry.left, width: geometry.width, top: BLOCK_INSET, bottom: BLOCK_INSET }}
    >
      <BlockLabel
        title={ order.name }
        sub={ subline(order, order.vehicle?.plateNumber, thin) }
        titleClass={ style.title }
        subClass={ style.sub }
      />
    </button>
  )
}

export default Block
