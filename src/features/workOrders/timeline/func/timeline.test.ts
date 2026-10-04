import {
  blockGeometry, duration, END, pxPerMinute, shortDuration, loadTone, offsetOf, PX_PER_MIN, snapStart, START, timeLabels, trackWidth,
} from '@/features/workOrders/timeline/func/timeline.ts'
import { clock, spanOnDay } from '@/lib/time.ts'

const day = new Date(2026, 9, 2)
const at = (date: number, hours: number, minutes = 0) => new Date(2026, 9, date, hours, minutes)

describe('timeline', () => {

  it.each([ [ 15, 2160 ], [ 30, 1440 ], [ 60, 900 ] ] as const)('spans the workshop hours at %s min: %s px', (zoom, width) => {
    expect(trackWidth(PX_PER_MIN[zoom])).toBe(width)
  })

  test('writes times and durations the way the timeline shows them', () => {
    expect(clock(510)).toBe('8:30')
    expect(duration(315)).toBe('5 h 15 min')
    expect(duration(90)).toBe('1 h 30 min')
    expect(shortDuration(345)).toBe('5 h 45')
    expect(shortDuration(120)).toBe('2 h')
    expect(shortDuration(30)).toBe('30 min')
    expect(duration(120)).toBe('2 h')
    expect(duration(45)).toBe('45 min')
  })

  test('labels every half hour, or every hour at 1 h, marking the hours', () => {
    expect(timeLabels(15).slice(0, 3)).toEqual([
      { minute: 480, label: '8:00', hour: true },
      { minute: 510, label: '8:30', hour: false },
      { minute: 540, label: '9:00', hour: true },
    ])
    expect(timeLabels(30)).toHaveLength(24)
    expect(timeLabels(60).map(({ label }) => label).slice(0, 2)).toEqual([ '8:00', '9:00' ])
  })

  test('places a block over its span, 2px in each side', () => {
    expect(blockGeometry({ start: 540, end: 600 }, 2)).toEqual({ left: 60 * 2 + 2, width: 60 * 2 - 4 })
  })

  test('clips a block to the workshop hours, and leaves out one outside them', () => {
    expect(blockGeometry({ start: 450, end: 510 }, 1.25)).toEqual({ left: 2, width: 30 * 1.25 - 4 })
    expect(blockGeometry({ start: 400, end: 470 }, 1.25)).toBeNull()
  })

  test('snaps a drop to 15 minutes, by its left edge', () => {
    /* a left edge 80 px in at 2 px a minute is 8:40, snapped to 8:45 */
    expect(snapStart(80, 60, 2)).toBe(525)
  })

  it.each([ 15, 30, 60 ] as const)('snaps to 15 minutes at %s min too', zoom => {
    const ppm = PX_PER_MIN[zoom]
    expect(snapStart(offsetOf(530, ppm), 60, ppm)).toBe(525)
    expect(snapStart(offsetOf(547, ppm), 60, ppm)).toBe(540)
  })

  test('keeps a drop whole within the workshop hours', () => {
    expect(snapStart(-50, 60, 2)).toBe(START)
    expect(snapStart(trackWidth(2), 90, 2)).toBe(END - 90)
    expect(PX_PER_MIN[30]).toBe(2)
  })

  test('cuts a stretch to the part of it on a day', () => {
    expect(spanOnDay(at(2, 14), at(2, 15, 30), day)).toEqual({ start: 840, end: 930 })
    expect(spanOnDay(at(1, 18), at(2, 10), day)).toEqual({ start: 0, end: 600 })
    expect(spanOnDay(at(2, 18), at(3, 10), day)).toEqual({ start: 1080, end: 1440 })
    expect(spanOnDay(at(3, 9), at(3, 10), day)).toBeNull()
  })

  it.each([ [ 600, 'high' ], [ 450, 'mid' ], [ 300, 'low' ] ] as const)('rates %s booked of 660 as %s', (booked, tone) => {
    expect(loadTone(booked, 660)).toBe(tone)
  })

  test('keeps the zoom’s density when the day would not fit, and stretches it to fill the room when it would', () => {
    /* 900 px of room: 1 h (1.25 px a minute) fits in 900 px, 30 min (1440 px) does not */
    expect(pxPerMinute(60, 1200)).toBe(1200 / 720)
    expect(pxPerMinute(30, 1200)).toBe(2)
    /* not measured yet */
    expect(pxPerMinute(60, 0)).toBe(1.25)
  })
})
