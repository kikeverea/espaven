import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createResource } from '@/api/resource'
import type { PersistedRecord } from '@/types'

type Part = PersistedRecord & { name: string, unitPrice: number }

const respondWith = (payload: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  )

describe('createResource', () => {

  const parts = createResource<Part>('/generic_parts')

  const requestOf = (spy: ReturnType<typeof respondWith>) => {
    const [ url, options ] = spy.mock.calls[0]

    return {
      url,
      method: options?.method,
      body: options?.body ? JSON.parse(options.body as string) : undefined
    }
  }

  beforeEach(() => { localStorage.setItem('token', 'a-token') })
  afterEach(() => { vi.restoreAllMocks() })

  test('reads the collection, paged and sorted', async () => {
    const spy = respondWith({ collection: [] })
    await parts.getAll({ page: 2, perPage: 25 })

    expect(requestOf(spy).url).toBe('http://localhost:3000/api/generic_parts?page=2&per_page=25')
  })

  test('reads the collection with no query', async () => {
    const spy = respondWith({ collection: [] })
    await parts.getAll()

    expect(requestOf(spy).url).toBe('http://localhost:3000/api/generic_parts')
  })

  test('reads a single item', async () => {
    const spy = respondWith({ id: 7 })
    await parts.get(7)

    expect(requestOf(spy).url).toBe('http://localhost:3000/api/generic_parts/7')
  })

  test('creates, without the fields the api assigns itself', async () => {
    const spy = respondWith({ id: 7 })
    await parts.create({ id: 7, name: 'Filtro', unitPrice: 3, createdAt: 'now' })

    expect(requestOf(spy)).toEqual({
      url: 'http://localhost:3000/api/generic_parts',
      method: 'POST',
      body: { name: 'Filtro', unit_price: 3 }
    })
  })

  test('updates the item at its own path', async () => {
    const spy = respondWith({ id: 7 })
    await parts.update(7, { name: 'Filtro' })

    expect(requestOf(spy)).toEqual({
      url: 'http://localhost:3000/api/generic_parts/7',
      method: 'PUT',
      body: { name: 'Filtro' }
    })
  })

  test('deletes the item it is given', async () => {
    const spy = respondWith({ id: 7 })
    await parts.delete({ id: 7 })

    const { url, method } = requestOf(spy)

    expect(url).toBe('http://localhost:3000/api/generic_parts/7')
    expect(method).toBe('DELETE')
  })

  test('deletes in batch', async () => {
    const spy = respondWith([ true, true ])
    await parts.deleteAll([ 7, 9 ])

    expect(requestOf(spy)).toEqual({
      url: 'http://localhost:3000/api/generic_parts/batch_destroy',
      method: 'POST',
      body: { ids: [ 7, 9 ] }
    })
  })

  test('runs the payload through a mapper when given one', async () => {
    const spy = respondWith({ id: 7 })
    const mapped = createResource<Part>('/generic_parts', {
      toApi: part => ({ name: part.name, extra_attributes: { price: part.unitPrice }}) as never
    })

    await mapped.create({ name: 'Filtro', unitPrice: 3 })

    expect(requestOf(spy).body).toEqual({ name: 'Filtro', extra_attributes: { price: 3 }})
  })
})
