import { format, isSameDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkOrder } from '@/features/workOrders/types'
import { duration } from '@/features/workOrders/timeline/func/timeline'
import { ROW_HEIGHT } from '@/features/workOrders/timeline/util/layout'
import { blockLayout, isThin, subline } from '@/features/workOrders/timeline/grid/blockText'
import BlockLabel from '@/features/workOrders/timeline/grid/BlockLabel'
import { LANES } from '@/features/workOrders/timeline/lanes/lanes'
import type { LaneType } from '@/features/workOrders/timeline/util/types'
import useDrag from '@/features/workOrders/timeline/hooks/useDrag.tsx'
import { AvatarStack, stackPadding } from '@/features/workOrders/timeline/TechnicianAvatar.tsx'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

type LaneCardProps = {
  order: WorkOrder
  laneType: LaneType
  ppm: number             // px a minute
  dimmed: boolean
  selected: boolean       // open in the details
  onSelect?: (order: WorkOrder) => void
  onHover: (rect: DOMRect | null) => void
}

/*
 * An order waiting off the timeline, as wide as it lasts, with the technicians it already has.
 * One booked for another day than the timeline's is locked: it cannot be dragged, and offers to go
 * to its day instead
 */
const LaneCard = ({ order, laneType, ppm, dimmed, selected, onSelect, onHover }: LaneCardProps) => {
  const lane = LANES[laneType]
  const width = order.labourMinutes * ppm - 4
  const thin = isThin(width)
  const technicians = thin ? [] : order.technicians ?? []

  const { day, onDayChange, startDrag, endDrag } = useDrag()

  const bookedAt = laneType === 'unassigned' && order.scheduledAt ? new Date(order.scheduledAt) : null
  const locked = bookedAt != null && !isSameDay(bookedAt, day)

  const card =
    <button
      type='button'
      draggable={ !locked }
      onDragStart={ startDrag(order, laneType) }
      onDragEnd={ endDrag }
      onClick={ locked ? undefined : () => onSelect?.(order) }      // locked, the menu opens instead
      onMouseEnter={ event => onHover(event.currentTarget.getBoundingClientRect()) }
      onMouseLeave={() => onHover(null)}
      className={ cn(
        'relative flex shrink-0 cursor-pointer flex-col justify-center gap-0.5 overflow-hidden rounded-[7px] border text-left transition-[border-color,box-shadow,opacity] focus-visible:outline-2 focus-visible:outline-[#3366E0]',
        blockLayout(thin),
        lane.card,
        selected && 'outline-2 outline-offset-1 outline-[#1C1917]',
        dimmed && 'opacity-35'
      )}
      style={{
        width,
        height: ROW_HEIGHT - 20,
        ...(technicians.length > 0 && { paddingRight: stackPadding(technicians.length) }),
        ...(locked && !thin && { paddingRight: stackPadding(1) }),
      }}
    >
      <AvatarStack technicians={ technicians } />
      { locked &&
        <Lock aria-hidden='true' data-locked className='absolute top-[5px] right-[5px] size-3.5 text-[#78716C]' />
      }

      <BlockLabel
        title={ order.name }
        sub={ subline(order, bookedAt ? format(bookedAt, 'd MMM, HH:mm', { locale: es }) : duration(order.labourMinutes), thin) }
        titleClass={ lane.cardTitle }
        subClass={ lane.sub }
      />
    </button>

  if (!locked)
    return card

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={ card } />
      <DropdownMenuContent>
        <DropdownMenuItem className='cursor-pointer text-xs' onClick={() => onDayChange(startOfDay(bookedAt))}>
          Ir al { format(bookedAt, "d 'de' MMMM", { locale: es }) }
        </DropdownMenuItem>
        <DropdownMenuItem className='cursor-pointer text-xs' onClick={() => onSelect?.(order)}>
          Ver detalles
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LaneCard
