import { addMinutes, isSameDay, startOfDay } from 'date-fns'

export type TimeSpan = { start: number, end: number }

export const minuteOfDay = (date: Date) => date.getHours() * 60 + date.getMinutes()

/* The moment `minute` is on `day` */
export const atMinute = (day: Date, minute: number) => addMinutes(startOfDay(day), minute)

/* 510 -> '8:30' */
export const clock = (minute: number) => `${Math.floor(minute / 60)}:${String(minute % 60).padStart(2, '0')}`

/* The part of `from` – `to` that falls on `day`, in minutes. Null when none does */
export const spanOnDay = (from: Date, to: Date, day: Date): TimeSpan | null => {
  const start = isSameDay(from, day) ? minuteOfDay(from) : from < startOfDay(day) ? 0 : null
  const end = isSameDay(to, day) ? minuteOfDay(to) : to > startOfDay(day) ? 24 * 60 : null

  if (start == null || end == null || end <= start)
    return null

  return { start, end }
}