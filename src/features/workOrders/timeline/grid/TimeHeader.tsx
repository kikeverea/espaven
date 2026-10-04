import { cn } from '@/lib/utils'
import { offsetOf, timeLabels, trackWidth } from '@/features/workOrders/timeline/func/timeline'
import type { Zoom } from '@/features/workOrders/timeline/util/types'
import { MONO } from '@/features/workOrders/timeline/util/styles'
import { NAME_COLUMN } from '@/features/workOrders/timeline/util/layout'
import { clock } from '@/lib/time.ts'

type TimeHeaderProps = {
  zoom: Zoom               // which labels
  ppm: number              // px a minute
  now: number | null       // the minute the now pill marks, when it shows
}

/* The hours along the top, pinned as the rows scroll under it */
const TimeHeader = ({ zoom, ppm, now }: TimeHeaderProps) =>
  <div className='sticky top-0 z-[7] flex h-9 border-b border-[#DCD9D5] bg-[#F1EFEC]'>
    <div
      className='sticky left-0 z-[1] flex shrink-0 items-center border-r border-[#DCD9D5] bg-[#F1EFEC] px-[18px] text-[11px] font-medium tracking-[.06em] text-[#78716C] uppercase'
      style={{ width: NAME_COLUMN }}
    >
      Técnico
    </div>

    <div className='relative shrink-0' style={{ width: trackWidth(ppm) }}>
      { timeLabels(zoom).map(({ minute, label, hour }) =>
        <span
          key={ minute }
          className={ cn('absolute inset-y-0 border-l ps-1.5 pt-[11px] text-[11px] leading-none whitespace-nowrap tabular-nums',
            hour ? 'border-[#DEDBD7] font-medium text-[#1C1917]' : 'border-[#ECEAE7] text-[#A8A29E]') }
          style={{ left: offsetOf(minute, ppm) }}
        >
          { label }
        </span>
      )}

      { now != null &&
        <span
          className={ cn(MONO, 'absolute top-[7px] z-[1] -translate-x-1/2 rounded-[5px] bg-[#E5484D] px-1.5 py-0.5 text-[11px] leading-[18px] font-medium text-white') }
          style={{ left: offsetOf(now, ppm) }}
        >
          { clock(now) }
        </span>
      }
    </div>
  </div>

export default TimeHeader
