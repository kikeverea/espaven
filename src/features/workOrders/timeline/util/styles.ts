import type { BlockStatus } from '@/features/workOrders/timeline/util/types'

/* Each status's name, as the details tell it */
export const TIMELINE_STATUS_LABELS: Record<BlockStatus | 'pause', string> = {
  done: 'Completada',
  live: 'En curso',
  todo: 'Pendiente',
  pause: 'En pausa',
}

/* The fonts the timeline is set in */
export const FONT = "font-['Geist_Variable',sans-serif]"
export const MONO = "font-['Geist_Mono_Variable',monospace] tabular-nums"

/* A thin scrollbar, both ways */
export const SCROLLBAR =
  '[scrollbar-color:#D6D3D1_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:size-2 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-[#D6D3D1]'
