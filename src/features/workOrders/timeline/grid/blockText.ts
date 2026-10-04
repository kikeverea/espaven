import type { WorkOrder } from '@/features/workOrders/types.ts'
import { THIN_BLOCK } from '@/features/workOrders/timeline/util/layout.ts'

/* Too narrow for a line of text: its text runs vertically */
export const isThin = (width: number) => width < THIN_BLOCK

/*
 * A block's layout: text across, or, thin, up from the bottom with title and subline side by side.
 * Thin, its lines stretch to the block's height (the cross axis, sideways), or they would grow as
 * long as their text and never end in an ellipsis
 */
export const blockLayout = (thin: boolean) =>
  thin
    ? '[writing-mode:vertical-rl] rotate-180 items-stretch px-1 py-2'
    : 'px-[9px]'

/*
 * The subline under the title: `OT-9201 · 1093 HTB`, or on a thin block the number without its
 * prefix, `9201 · 1093 HTB`. A thin block of 15 minutes or less has room for its title only
 */
export const subline = (order: WorkOrder, detail: string | null | undefined, thin: boolean) =>
  thin && order.labourMinutes <= 15
    ? null
    : [ thin ? order.number.replace(/^OT-/, '') : order.number, detail ].filter(Boolean).join(' · ')
