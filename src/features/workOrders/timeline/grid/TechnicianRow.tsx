import type { Technician } from '@/features/users/types'
import type { WorkOrder } from '@/features/workOrders/types'
import type { ScheduleUnavailability } from '@/features/unavailabilities/types'
import { trackWidth } from '@/features/workOrders/timeline/func/timeline'
import { load } from '@/features/workOrders/timeline/func/planner'
import { ROW_HEIGHT } from '@/features/workOrders/timeline/util/layout'
import TechnicianCell from '@/features/workOrders/timeline/grid/TechnicianCell'
import UnavailableBand from '@/features/workOrders/timeline/grid/UnavailableBand'
import Block from '@/features/workOrders/timeline/grid/Block'
import GhostBlock from '@/features/workOrders/timeline/grid/GhostBlock'
import useDrag from '@/features/workOrders/timeline/hooks/useDrag'
import type { TimeSpan } from '@/lib/time'

type TechnicianRowProps = {
  technician: Technician
  ppm: number             // px a minute
  orders: WorkOrder[]
  unavailable: { unavailability: ScheduleUnavailability, span: TimeSpan }[]
  onSelect?: (id: WorkOrder['id']) => void
  onHover: (order: WorkOrder, rect: DOMRect | null) => void
}

/* A technician's day: their cell, then a track with their orders and the stretches they are out */
const TechnicianRow = ({ technician, ppm, orders, unavailable, ...props }: TechnicianRowProps) => {
  const { drag, ghost: placing, startDrag, endDrag, dragOverRow, dropOnRow } = useDrag()
  const ghost = placing?.technicianId === technician.id ? placing : null       // only when it is on this row

  return (
    <div className='flex border-b border-[#E3E0DC]' style={{ height: ROW_HEIGHT }}>
      <TechnicianCell technician={ technician } { ...load(orders, unavailable.map(({ span }) => span)) } />

      <div
        role='group'
        aria-label={ `Agenda de ${technician.fullName}` }
        className='relative shrink-0'
        style={{
          width: trackWidth(ppm),
          backgroundColor: ghost ? '#EEF2FC' : '#F7F6F4',
          /* a line every half hour, a stronger one every hour */
          backgroundImage: 'linear-gradient(to right, #DEDBD7 1px, transparent 1px), linear-gradient(to right, #ECEAE7 1px, transparent 1px)',
          backgroundSize: `${60 * ppm}px 100%, ${30 * ppm}px 100%`,
        }}
        onDragOver={ dragOverRow(technician) }
        onDrop={ dropOnRow(technician) }
      >
        { unavailable.map(({ unavailability, span }) =>
          <UnavailableBand key={ unavailability.id } unavailability={ unavailability } span={ span } ppm={ ppm } />
        )}

        { orders.map(order =>
          <Block
            key={ order.id }
            order={ order }
            ppm={ ppm }
            dimmed={ drag?.order.id === order.id }
            onSelect={ props.onSelect }
            onDragStart={ startDrag(order, 'row', technician) }
            onDragEnd={ endDrag }
            onHover={ rect => props.onHover(order, rect) }
          />
        )}

        { ghost && <GhostBlock ghost={ ghost } name={ drag?.order.name ?? '' } ppm={ ppm } /> }
      </div>
    </div>
  )
}

export default TechnicianRow
