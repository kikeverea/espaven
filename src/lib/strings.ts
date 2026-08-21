import type { Primitive } from '@/types.ts'

export const stringify = (data: unknown): string => data == null ? '' : String(data)

export const normalized = (s?: string) => s?.toLowerCase().trim() || ''

export const titleize = (s: string): string => {
  return s
  .split(' ')
  .map(p => `${p.charAt(0).toUpperCase()}${p.substring(1)}`)
  .join(' ')
}

export const camelize = (s: string): string =>
  s.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')


export const normalizedValue = (val: Primitive | Primitive[]) => {
  const value = Array.isArray(val) ? val.join(' ') : val

  return typeof value === 'string'
    ? normalized(value)
    : normalized(value !== undefined && value !== null ? String(value) : '')
}

export const timeString = (timestamp: string | null): string => {
  if (!timestamp)
    return '-'

  const date = new Date(timestamp)
  const now = new Date()

  const diffMs = now.getTime() - date.getTime()

  const minutes = Math.floor(diffMs / 60_000)
  const hours = Math.floor(diffMs / 3_600_000)
  const days = Math.floor(diffMs / 86_400_000)

  if (minutes < 1)
    return 'Ahora'

  if (minutes < 60)
    return `${minutes} minutos`

  if (hours < 24)
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`

  if (days === 1)
    return 'Ayer'

  if (days < 7)
    return `${days} días`

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
}