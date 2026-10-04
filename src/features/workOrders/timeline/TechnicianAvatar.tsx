import { cn } from '@/lib/utils'
import type { Technician } from '@/features/users/types'

/* Initials on a tint of their own, so technicians tell apart at a glance */
const AVATAR_TINTS = [
  'bg-[#FDE7E4] text-[#B42318]',
  'bg-[#E6E8FD] text-[#3538CD]',
  'bg-[#E3F4EA] text-[#067647]',
  'bg-[#FDF0DC] text-[#B54708]',
  'bg-[#F0E6FD] text-[#6941C6]',
  'bg-[#DFF2FB] text-[#026AA2]',
]

/* On blocks and cards (16), in the technician picker (26), the details' list (30) and the rows (32) */
const SIZES = {
  xs: 'size-4 text-[8px] shadow-[0_0_0_1.5px_#FFFFFF]',
  sm: 'size-[26px] text-[11px]',
  md: 'size-[30px] text-xs',
  lg: 'size-8 text-[13px]',
}

export const firstName = (technician: Technician) => technician.fullName.split(/\s+/)[0]

export const initials = (technician: Technician) =>
  technician.fullName.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()

type TechnicianAvatarProps = {
  technician: Technician
  size: keyof typeof SIZES
  className?: string
}

const TechnicianAvatar = ({ technician, size, className }: TechnicianAvatarProps) =>
  <span
    title={ size === 'xs' ? technician.fullName : undefined }
    className={ cn('grid shrink-0 place-content-center rounded-full leading-none font-semibold',
      SIZES[size],
      AVATAR_TINTS[technician.id % AVATAR_TINTS.length],
      className) }
  >
    { initials(technician) }
  </span>

/* An order's other technicians, stacked in a block's or a card's top right corner */
export const AvatarStack = ({ technicians }: { technicians: Technician[] }) =>
  technicians.length > 0 &&
    <span aria-hidden='true' className='absolute top-[5px] right-[5px] flex gap-0.5'>
      { technicians.map(technician => <TechnicianAvatar key={ technician.id } technician={ technician } size='xs' />) }
    </span>

/* The room a block's text leaves for the stack: 9px of its own padding, and 18px an avatar */
export const stackPadding = (count: number) => 9 + count * 18

export default TechnicianAvatar
