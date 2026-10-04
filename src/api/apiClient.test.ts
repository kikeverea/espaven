import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { api } from '@/api/apiClient'
import type { EntityCollection } from '@/components/Table/useCollection'
import type { PersistedRecord } from '@/types'
import { collectionQuery } from '@/test/util.ts'

type Part = PersistedRecord & { name: string, inventoryCategory: { id: number, appliesSigaus: boolean } }

const respondWith = (payload: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  )

describe('apiFetch', () => {

  const { apiFetch } = api()

  beforeEach(() => { localStorage.setItem('token', 'a-token') })
  afterEach(() => { vi.restoreAllMocks() })

  test('keeps the collection wrapper and camelizes the items', async () => {
    respondWith({
      collection: [
        { id: 1, name: 'Aceite de motor', created_at: '2026-09-07T00:29:53.297Z',
          inventory_category: { id: 9, applies_sigaus: true } }
      ]
    })

    const parts = await apiFetch<EntityCollection<Part>>('/generic_parts')

    expect(parts.collection).toEqual([
      { id: 1, name: 'Aceite de motor', createdAt: '2026-09-07T00:29:53.297Z',
        inventoryCategory: { id: 9, appliesSigaus: true } }
    ])
  })

  test('camelizes pagination alongside the collection', async () => {
    respondWith({
      collection: [],
      pagination: { page: 1, pages: 17, count: 405, per_page: 25, next: 2, prev: null }
    })

    const parts = await apiFetch<EntityCollection<Part>>('/generic_parts')

    expect(parts.pagination).toEqual({ page: 1, pages: 17, count: 405, perPage: 25, next: 2, prev: null })
  })

  test('omits pagination when the endpoint does not paginate', async () => {
    respondWith({ collection: [{ id: 1, name: 'ml', created_at: '2026-09-07T00:29:53.297Z' }] })

    const units = await apiFetch<EntityCollection<Part>>('/units_of_measure')

    expect(units.pagination).toBeUndefined()
    expect(units.collection).toHaveLength(1)
  })

  test('does not mistake a single entity with a collection field for a collection', async () => {
    respondWith({ id: 1, name: 'Kit', collection: 'invierno' })

    const part = await apiFetch<Part>('/inventory_items/1')

    expect(part).toEqual({ id: 1, name: 'Kit', collection: 'invierno' })
  })

  test('applies the entity mapper to every item of the collection', async () => {
    respondWith({ collection: [{ id: 1, price_cents: 105 }, { id: 2, price_cents: 250 }] })

    const { apiFetch: mapped } = api<any, any, any>({
      fromApi: item => ({ ...item, price: item.priceCents / 100 })
    })
    const items = await mapped<EntityCollection<any>>('/inventory_items')

    expect(items.collection.map(item => item.price)).toEqual([1.05, 2.5])
  })
})

describe('collectionQuery', () => {

  test('is empty without a query, so unparameterised endpoints keep a clean url', () => {
    expect(collectionQuery()).toBe('')
    expect(collectionQuery({})).toBe('')
  })

  test('snake cases perPage for the api', () => {
    expect(collectionQuery({ page: 3, perPage: 50 })).toBe('?page=3&per_page=50')
  })

  test('sends only what it was given', () => {
    expect(collectionQuery({ page: 2 })).toBe('?page=2')
    expect(collectionQuery({ perPage: 10 })).toBe('?per_page=10')
  })

  test('sends the sort key the api knows, not the column header', () => {
    expect(collectionQuery({ sort: { column: 'categoría', key: 'category', direction: 'desc' } }))
      .toBe('?sort=category&direction=desc')
  })

  test('falls back to the column name when the column declares no key', () => {
    expect(collectionQuery({ sort: { column: 'name' } })).toBe('?sort=name&direction=asc')
  })

  test('combines paging and sorting', () => {
    expect(collectionQuery({ page: 2, perPage: 25, sort: { column: 'nombre', key: 'name' } }))
      .toBe('?page=2&per_page=25&sort=name&direction=asc')
  })
})

describe('genericPart.api', () => {

  afterEach(() => { vi.restoreAllMocks() })

  test('requests the asked-for page and order', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ collection: [], pagination: { page: 3, pages: 17, count: 405, per_page: 25, next: 4, prev: 2 } }),
        { status: 200, headers: { 'Content-Type': 'application/json' } })
    )

    const service = (await import('@/features/inventory/inventoryItems/data/inventoryItem.api.ts')).default
    await service.getAll({ page: 3, perPage: 25, sort: { column: 'categoría', key: 'category' } })

    expect(fetchSpy.mock.calls[0][0])
      .toBe('http://localhost:3000/api/generic_parts?page=3&per_page=25&sort=category&direction=asc')
  })
})
