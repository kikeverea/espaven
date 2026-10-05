import type { WorkOrder } from '@/features/workOrders/types'
import Lane from '@/features/workOrders/timeline/lanes/Lane'
import type { LaneType } from '@/features/workOrders/timeline/util/types'

type LanesProps = {
  unassigned: WorkOrder[]
  unscheduled: WorkOrder[]
  paused: WorkOrder[]
  ppm: number             // px a minute
  width: number
  selectedId?: WorkOrder['id'] | null
  onSelect?: (order: WorkOrder) => void
  onHover: (order: WorkOrder, rect: DOMRect | null) => void
}

const Lanes = ({ unassigned, unscheduled, paused, ...props }: LanesProps) => {
  const lane = (name: LaneType, orders: WorkOrder[]) =>
    <Lane
      laneType={ name }
      orders={ orders }
      ppm={ props.ppm }
      width={ props.width }
      selectedId={ props.selectedId }
      onSelect={ props.onSelect }
      onHover={ props.onHover }
    />

  return (
    <div className='sticky bottom-0 z-6 border-t-[3px] border-[#CFCBC6] shadow-[0_-6px_14px_rgba(28,25,23,.06)]'>
      { lane('unassigned', unassigned) }
      { lane('unscheduled', unscheduled) }
      { lane('paused', paused) }
    </div>
  )
}

export default Lanes
