import { cn } from '@/lib/utils'
import { MONO } from '@/features/workOrders/timeline/util/styles'

/* A Spanish number plate: the blue band with the E, then the number */
const PlateBadge = ({ plate, size = 'md' }: { plate?: string, size?: 'sm' | 'md' }) =>
  <span
    className={ cn('inline-flex shrink-0 items-stretch overflow-hidden rounded-[5px] border-[1.5px] border-[#1C1917] bg-white',
      size === 'md' ? 'h-9' : 'h-7') }
  >
    <span aria-hidden className={ cn('flex items-end justify-center bg-[#1D4ED8] pb-0.5 font-semibold text-white', size === 'md' ? 'w-4 text-[8px]' : 'w-3 text-[7px]') }>
      E
    </span>
    <span className={ cn(MONO, 'flex items-center font-bold tracking-[.06em] whitespace-nowrap',
      size === 'md' ? 'px-2.5 text-[17px]' : 'px-2 text-[13px]') }
    >
      { plate || '—' }
    </span>
  </span>

export default PlateBadge
