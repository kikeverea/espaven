import type { BlockStatus } from '@/features/workOrders/timeline/util/types'

/* Each status's look on the timeline: the card (background and border), its title and its subline */
export const TIMELINE_STATUS_STYLE: Record<BlockStatus | 'pause', { label: string, card: string, title: string, sub: string }> = {
  done: { label: 'Completada', card: 'border-[#BFDCC8] bg-[#E8F3EC]', title: 'text-[#2F5E3F]', sub: 'text-[#5E8A6C]' },
  live: { label: 'En curso', card: 'border-[#2A57C2] bg-[#3366E0]', title: 'text-white', sub: 'text-[#DCE6FB]' },
  todo: { label: 'Pendiente', card: 'border-[#C9C5C0] bg-white shadow-[0_1px_2px_rgba(28,25,23,.10)]', title: 'text-[#1C1917]', sub: 'text-[#78716C]' },
  pause: {
    label: 'En pausa',
    card: 'border-[#E9B85C] bg-[repeating-linear-gradient(135deg,#FBEBC8_0_6px,#F6DDA6_6px_12px)]',
    title: 'text-[#6B3F02]',
    sub: 'text-[#8A5A0B]',
  },
}

/* The fonts the timeline is set in */
export const FONT = "font-['Geist_Variable',sans-serif]"
export const MONO = "font-['Geist_Mono_Variable',monospace] tabular-nums"

/* A thin scrollbar, both ways */
export const SCROLLBAR =
  '[scrollbar-color:#D6D3D1_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:size-2 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-[#D6D3D1]'
