import { cn } from '@/lib/utils'
import { blockGeometry } from '@/features/workOrders/timeline/func/timeline'
import { MONO } from '@/features/workOrders/timeline/util/styles'
import { BLOCK_INSET } from '@/features/workOrders/timeline/util/layout'
import type { Ghost } from '@/features/workOrders/timeline/util/types'
import { clock } from '@/lib/time.ts'
import { firstName } from '@/features/workOrders/timeline/TechnicianAvatar'

type GhostBlockProps = {
  ghost: Ghost
  name: string
  ppm: number             // px a minute
}

/*
 * Where the dragged order would land: a dashed outline with its name, and above it the times it
 * would take, or why it cannot go there
 */
const GhostBlock = ({ ghost, name, ppm }: GhostBlockProps) => {
  const geometry = blockGeometry(ghost.span, ppm)
  if (!geometry) return null

  const conflict = ghost.conflict

  return (
    <div
      className={ cn('pointer-events-none absolute z-[8] flex items-center rounded-[7px] border-[1.5px] border-dashed px-[9px]',
        conflict ? 'border-[#E5484D] bg-[#E5484D]/8 text-[#C52B30]' : 'border-[#3366E0] bg-[#3366E0]/8 text-[#2A57C2]') }
      style={{ left: geometry.left, width: geometry.width, top: BLOCK_INSET, bottom: BLOCK_INSET }}
    >
      <span
        aria-live='polite'
        className={ cn('absolute bottom-[calc(100%+6px)] left-0 rounded-[5px] px-1.5 py-0.5 text-[11px] leading-4 font-medium whitespace-nowrap text-white shadow-md',
          !conflict && MONO,
          conflict ? 'bg-[#E5484D]' : 'bg-[#3366E0]') }
      >
        { conflictLabel(ghost) ?? `${clock(ghost.span.start)} – ${clock(ghost.span.end)}` }
      </span>

      <span className='min-w-0 truncate text-[12.5px] leading-[1.25] font-semibold'>{ name }</span>
    </div>
  )
}

/* Why it cannot go there: the row's own clash, or which other of its technicians is busy then */
const conflictLabel = ({ conflict, technicianId }: Ghost) => {
  if (!conflict) return null

  if (conflict.technician.id !== technicianId)
    return `${firstName(conflict.technician)} está ocupado`

  return conflict.reason === 'order' ? 'Solapa con otra orden' : 'No disponible'
}

export default GhostBlock
