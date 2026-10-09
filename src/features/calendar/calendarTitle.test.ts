import { calendarTitle } from '@/features/calendar/calendarTitle'

describe('calendarTitle', () => {

  const view = (type: string, start: Date, end: Date) =>
    ({ type, title: 'del calendario', currentStart: start, currentEnd: end })

  test('names a week or a month within one month by it', () => {
    expect(calendarTitle(view('timeGridWeek', new Date(2026, 9, 5), new Date(2026, 9, 12)))).toBe('octubre de 2026')
    expect(calendarTitle(view('dayGridMonth', new Date(2026, 9, 1), new Date(2026, 10, 1)))).toBe('octubre de 2026')
  })

  test('names both months, in full, of a week across them', () => {
    expect(calendarTitle(view('timeGridWeek', new Date(2026, 9, 26), new Date(2026, 10, 2)))).toBe('octubre – noviembre de 2026')
  })

  test('names both years of a week across them', () => {
    expect(calendarTitle(view('timeGridWeek', new Date(2026, 11, 28), new Date(2027, 0, 4)))).toBe('diciembre de 2026 – enero de 2027')
  })

  test('leaves a day its own title', () => {
    expect(calendarTitle(view('timeGridDay', new Date(2026, 9, 5), new Date(2026, 9, 6)))).toBe('del calendario')
  })
})
