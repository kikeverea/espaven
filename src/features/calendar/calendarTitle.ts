import { format, isSameMonth, isSameYear, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ViewApi } from '@fullcalendar/react'

const month = (date: Date) => format(date, 'MMMM', { locale: es })
const monthYear = (date: Date) => format(date, "MMMM 'de' yyyy", { locale: es })

/*
 * The months a week or a month view spans, named in full: 'octubre de 2026', 'octubre – noviembre de
 * 2026', or across years 'diciembre de 2026 – enero de 2027'. A day keeps the calendar's own title
 */
export const calendarTitle = ({ type, title, currentStart, currentEnd }: Pick<ViewApi, 'type' | 'title' | 'currentStart' | 'currentEnd'>) => {
  if (type === 'timeGridDay')
    return title

  const last = subDays(currentEnd, 1)      // the end is the day after

  if (isSameMonth(currentStart, last)) return monthYear(currentStart)
  if (isSameYear(currentStart, last)) return `${month(currentStart)} – ${monthYear(last)}`
  return `${monthYear(currentStart)} – ${monthYear(last)}`
}
