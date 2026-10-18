import { cn } from '@/lib/utils'
import type { ListingStatus } from '@/features/vehicleListings/types'
import { euros, STATUS_LABELS } from '@/features/vehicleListings/labels'
import { BARLOW } from '@/features/vehicleListings/styles'

/* A 4:3 photo, or the stripes it stands in for */
export const Cover = ({ url, alt, dark = false, className }: { url?: string, alt: string, dark?: boolean, className?: string }) =>
  <div
    className={ cn('relative aspect-[4/3] overflow-hidden', className) }
    style={ url ? undefined : {
      background: dark
        ? 'repeating-linear-gradient(135deg,#17171A 0 14px,#121214 14px 28px)'
        : 'repeating-linear-gradient(135deg,#EFEDEA 0 14px,#E8E6E2 14px 28px)',
    }}
  >
    { url && <img src={ url } alt={ alt } className='size-full object-cover' /> }
  </div>

/* The gold price tag at the photo's corner */
export const PriceTag = ({ cents }: { cents?: number | null }) =>
  cents == null ? null :
    <span className={ cn(BARLOW, 'absolute top-0 right-0 bg-[#C9A227] px-[13px] py-[7px] text-[17px] leading-none font-bold text-[#0B0B0C]') }>
      { euros(cents) }
    </span>

const STATUS_STYLES: Record<ListingStatus, string> = {
  published: 'bg-[#E7F5EC] text-[#1F7A44]',
  draft: 'bg-[#F1EFEC] text-[#57534E]',
  reserved: 'bg-[#FEF3E2] text-[#B45309]',
  sold: 'bg-[#E8EEFC] text-[#2A57C4]',
}

export const StatusBadge = ({ status, className }: { status: ListingStatus, className?: string }) =>
  <span className={ cn('inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold', STATUS_STYLES[status], className) }>
    { STATUS_LABELS[status] }
  </span>
