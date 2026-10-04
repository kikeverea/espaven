import type { ScheduleUnavailability } from '@/features/unavailabilities/types.ts'
import { blockGeometry } from '@/features/workOrders/timeline/func/timeline.ts'
import type { TimeSpan } from '@/lib/time'

type UnavailableBandProps = {
  unavailability: ScheduleUnavailability
  span: TimeSpan
  ppm: number             // px a minute
}

/* A stretch the technician is out, hatched across their row, under their orders */
const UnavailableBand = ({ unavailability, span, ppm }: UnavailableBandProps) => {
  const geometry = blockGeometry(span, ppm)
  if (!geometry) return null

  return (
    <div
      className='absolute inset-y-0 z-[1] flex items-center justify-center overflow-hidden bg-[repeating-linear-gradient(135deg,#EAE8E4_0_6px,#F3F1EE_6px_12px)] text-[11px] text-[#A8A29E]'
      style={{ left: geometry.left - 2, width: geometry.width + 4 }}
    >
      <span className='truncate px-1'>{ unavailability.reason || 'No disponible' }</span>
    </div>
  )
}

export default UnavailableBand
