import { clock, type TimeSpan } from '@/lib/time'
import type { DragEvent } from 'react'
import type { Drag, LaneType, ScheduleChange } from '@/features/workOrders/timeline/util/types'
import type { Zoom } from '@/features/workOrders/timeline/util/types.ts'

/* Times are minutes from midnight on the timeline's day: 8:30 is 510 */

export const zooms: { value: Zoom, label: string }[] = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 h' },
]

/* The workshop's hours: what the timeline spans */
export const START = 8 * 60
export const END = 20 * 60

/* How dense each zoom is, at least: px a minute. With room to spare, the day stretches to fill it */
export const PX_PER_MIN: Record<Zoom, number> = { 15: 3, 30: 2, 60: 1.25 }

/* The px a minute the day is drawn at: the zoom's, or more, so the day fills `available` px */
export const pxPerMinute = (zoom: Zoom, available: number) =>
  Math.max(PX_PER_MIN[zoom], available > 0 ? available / (END - START) : 0)

/* What a drop snaps to, whatever the zoom */
const SNAP = 15

export const trackWidth = (ppm: number) => (END - START) * ppm

/* 90 -> '1 h 30 min', 120 -> '2 h', 45 -> '45 min' */
export const duration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (!hours) return `${rest} min`
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

/* Where room is short, like a technician's load: 345 -> '5 h 45', 30 -> '30 min' */
export const shortDuration = (minutes: number) => duration(minutes).replace(/ min$/, minutes >= 60 ? '' : ' min')

/* The labels along the top: every half hour, or every hour at 1 h. Never closer than they fit */
export const timeLabels = (zoom: Zoom) => {
  const step = zoom === 60 ? 60 : 30

  return Array.from({ length: (END - START) / step }, (_, index) => {
    const minute = START + index * step
    return { minute, label: clock(minute), hour: minute % 60 === 0 }
  })
}

/* Pixels from the track's left edge to `minute` */
export const offsetOf = (minute: number, ppm: number) => (minute - START) * ppm

/*
 * Where a block over `span` sits on the track: inset 2px each side, clipped to the workshop's
 * hours, and null when it falls outside them altogether
 */
export const blockGeometry = (span: TimeSpan, ppm: number): { left: number, width: number } | null => {
  const start = Math.max(span.start, START)
  const end = Math.min(span.end, END)

  if (end <= start)
    return null

  return { left: offsetOf(start, ppm) + 2, width: (end - start) * ppm - 4 }
}

/*
 * The start a dragged order lands on, its left edge `left` pixels into the track: snapped to 15
 * minutes, and kept whole within the workshop's hours
 */
export const snapStart = (left: number, minutes: number, ppm: number) => {
  const start = Math.round((START + left / ppm) / SNAP) * SNAP

  return Math.min(Math.max(start, START), END - minutes)
}

export const overlaps = (a: TimeSpan, b: TimeSpan) => a.start < b.end && b.start < a.end

/* How booked a technician is: >85% red, >65% amber, blue otherwise */
export const loadTone = (booked: number, capacity: number): 'high' | 'mid' | 'low' => {
  const ratio = capacity ? booked / capacity : 0
  return ratio > 0.85 ? 'high' : ratio > 0.65 ? 'mid' : 'low'
}

/* A transparent pixel, loaded ahead: an image must be ready by the time a drag starts */
const BLANK = typeof Image === 'undefined' ? null : Object.assign(new Image(), {
  src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
})

/* Drags nothing visible: the browser cannot change its image mid-drag, so the timeline draws its own */
export const hideDragImage = (event: DragEvent<HTMLElement>) => {
  if (BLANK && event.dataTransfer?.setDragImage)
    event.dataTransfer.setDragImage(BLANK, 0, 0)
}

export const laneChange = (lane: LaneType, drag: Drag): ScheduleChange | null =>
  drag.from === lane
    ? null
    : { technicians: [], scheduledAt: null, status: lane === 'paused' ? 'paused' : 'notStarted' }