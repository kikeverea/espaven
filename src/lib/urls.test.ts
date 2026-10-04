import { describe, expect } from 'vitest'
import { withParams } from '@/lib/urls.ts'

describe('withParams', () => {

  test('adds the params to the path', () => {
    expect(withParams('/work_orders', { day: '2026-10-04', page: 2 })).toBe('/work_orders?day=2026-10-04&page=2')
  })

  test('adds them after the ones the path already has', () => {
    expect(withParams('/work_orders?page=2', { scheduled: true })).toBe('/work_orders?page=2&scheduled=true')
  })

  test('keeps one value per key, the given one over the path\'s', () => {
    expect(withParams('/work_orders?page=2&sort=name', { page: 5 })).toBe('/work_orders?page=5&sort=name')
  })

  test('keeps the path\'s params when given none', () => {
    expect(withParams('/work_orders?page=2', { page: null })).toBe('/work_orders?page=2')
  })

  test('is just the query on an empty path', () => {
    expect(withParams('', { page: 2 })).toBe('?page=2')
    expect(withParams('', {})).toBe('')
  })

  test('leaves out params with no value', () => {
    expect(withParams('/work_orders', { a: null, b: undefined, c: '', d: 0, e: false })).toBe('/work_orders?d=0&e=false')
  })

  test('leaves the path as it is without params', () => {
    expect(withParams('/work_orders')).toBe('/work_orders')
    expect(withParams('/work_orders', {})).toBe('/work_orders')
    expect(withParams('/work_orders', { a: null })).toBe('/work_orders')
  })

  test('encodes the values', () => {
    expect(withParams('/contacts', { search: 'García & co' })).toBe('/contacts?search=Garc%C3%ADa+%26+co')
  })
})
