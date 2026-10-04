import type { Lane, LaneType } from '@/features/workOrders/timeline/util/types'

export const LANES: Record<LaneType, Lane> = {
  unscheduled: {
    title: 'Sin programar',
    empty: 'Todo programado.',
    badge: 'bg-blue-200 text-blue-500',
    track: 'repeating-linear-gradient(135deg,#E4E1DD 0 6px,#EFEDEA 6px 12px)',
    dropTrack: '#EEF2FC',
    card: 'border-dashed border-[#A8A29E] bg-white hover:border-solid hover:border-[#57534E] hover:shadow-[0_2px_8px_rgba(28,25,23,.08)]',
    cardTitle: 'text-[#1C1917]',
    sub: 'text-[#78716C]',
  },
  paused: {
    title: 'En pausa',
    empty: 'Nada en pausa.',
    badge: 'bg-amber-500 text-white',
    track: 'repeating-linear-gradient(135deg,#E4E1DD 0 6px,#EFEDEA 6px 12px)',
    dropTrack: '#FDF6E7',
    card: 'border-dashed border-[#D9A443] bg-[repeating-linear-gradient(135deg,#FBEBC8_0_6px,#F6DDA6_6px_12px)] hover:border-solid hover:border-[#B07A1A]',
    cardTitle: 'text-[#6B3F02]',
    sub: 'text-[#8A5A0B]',
  },
}
