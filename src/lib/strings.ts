import type { Primitive } from '@/types.ts'

export const normalized = (s: string) => s?.toLowerCase().trim() || ''

export const titleize = (s: string): string => {
  return s
  .split(' ')
  .map(p => `${p.charAt(0).toUpperCase()}${p.substring(1)}`)
  .join(' ')
}

export const normalizedValue = (val: Primitive | Primitive[]) => {
  const value = Array.isArray(val) ? val.join(' ') : val

  return typeof value === 'string'
    ? normalized(value)
    : normalized(value !== undefined && value !== null ? String(value) : '')
}