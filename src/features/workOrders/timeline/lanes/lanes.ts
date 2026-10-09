import type { Lane, LaneType } from '@/features/workOrders/timeline/util/types'
import { SCHEDULABLE_STYLES } from '@/features/schedulables/styles'

/*
 * Waiting orders look as those on the timeline: white, edged in the work orders' colour. On hover they
 * lift, not darken their border, which would take the edge's colour too
 */
const workOrder = SCHEDULABLE_STYLES.workOrder!
const WORK_ORDER_CARD = {
  card: `${workOrder.card} hover:shadow-[0_2px_8px_rgba(28,25,23,.12)]`,
  cardTitle: workOrder.title,
  sub: workOrder.sub,
}

export const LANES: Record<LaneType, Lane> = {
  unassigned: {
    title: 'Programados sin técnico',
    empty: 'Todo lo programado tiene técnico.',
    badge: 'bg-[#3366E0] text-white',
    track: 'repeating-linear-gradient(135deg,#E4E1DD 0 6px,#EFEDEA 6px 12px)',
    dropTrack: '#EEF2FC',
    ...WORK_ORDER_CARD,
  },
  unscheduled: {
    title: 'Sin programar',
    empty: 'Todo programado.',
    badge: 'bg-blue-200 text-blue-500',
    track: 'repeating-linear-gradient(135deg,#E4E1DD 0 6px,#EFEDEA 6px 12px)',
    dropTrack: '#EEF2FC',
    ...WORK_ORDER_CARD,
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
