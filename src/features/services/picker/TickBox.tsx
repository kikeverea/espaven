import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PickState } from '@/features/services/picker/catalogue'

/* The box of a pickable card: ticked, a dash when part of what it holds is picked, or empty */
const TickBox = ({ state }: { state: PickState }) =>
  <span
    aria-hidden
    className={ cn('grid size-[18px] shrink-0 place-content-center rounded-[5px] border transition-colors',
      state === 'none' ? 'border-[#C9C5C0] bg-white' : 'border-[#3366E0] bg-[#3366E0] text-white') }
  >
    { state === 'all' && <Check className='size-3' strokeWidth={ 3 } /> }
    { state === 'some' && <Minus className='size-3' strokeWidth={ 3 } /> }
  </span>

export default TickBox
