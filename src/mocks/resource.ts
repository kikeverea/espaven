import type { MockHandler, MockRequest } from '@/mocks/server'

export type Row = { id: number } & Record<string, unknown>

type MockResourceOptions = {
  searchIn?: string[]
  /* what a collection keeps, besides the search. All of it by default */
  scope?: (rows: Row[], params: URLSearchParams) => Row[]
  /* a row as the api serves it, nested records and all */
  serialize?: (row: Row, rows: Row[]) => Row
}

export type MockResource = {
  handle: MockHandler
  insert: (row: Omit<Row, 'id'>) => Row
  find: (id: number) => Row | undefined
}

/*
 * A resource the way the api serves one, kept in memory and snake cased: paged collections,
 * search by `searchIn`, get, create, update, delete and batch_destroy
 */
export const mockResource = (path: string, seed: Row[], options: MockResourceOptions = {}): MockResource => {
  const { searchIn = [ 'name' ], scope = rows => rows, serialize = row => row } = options

  let rows = [ ...seed ]
  let nextId = Math.max(0, ...rows.map(({ id }) => id)) + 1

  const insert = (fields: Omit<Row, 'id'>) => {
    const row = { created_at: new Date().toISOString(), ...fields, id: nextId++ }
    rows = [ ...rows, row ]
    return serialize(row, rows)
  }

  const list = ({ params }: MockRequest) => {
    const search = params.get('search')?.toLowerCase()
    const page = Number(params.get('page') ?? 1)
    const perPage = Number(params.get('per_page') ?? 1000)

    const found = scope(rows, params).filter(row => !search || searchIn.some(field => String(row[field] ?? '').toLowerCase().includes(search)))
    const pages = Math.max(1, Math.ceil(found.length / perPage))

    return {
      collection: found.slice((page - 1) * perPage, page * perPage).map(row => serialize(row, rows)),
      pagination: { page, pages, count: found.length, per_page: perPage, next: page < pages ? page + 1 : null, prev: page > 1 ? page - 1 : null },
    }
  }

  const handle: MockHandler = request => {
    const { method, path: requested, body } = request

    if (requested === path)
      switch (method) {
        case 'GET': return list(request)
        case 'POST': return insert(body as Omit<Row, 'id'>)
      }

    if (requested === `${path}/batch_destroy` && method === 'POST') {
      const ids = (body as { ids: number[] }).ids
      rows = rows.filter(({ id }) => !ids.includes(id))
      return ids.map(() => true)
    }

    const [ , id ] = requested.match(new RegExp(`^${path}/(\\d+)$`)) ?? []
    if (!id)
      return undefined

    const row = rows.find(row => row.id === Number(id))
    if (!row)
      return new Response(JSON.stringify({ exception: 'Not found' }), { status: 404 })

    switch (method) {
      case 'GET': return serialize(row, rows)
      case 'PUT': {
        const updated = { ...row, ...(body as object) }
        rows = rows.map(other => other.id === row.id ? updated : other)
        return serialize(updated, rows)
      }
      case 'DELETE':
        rows = rows.filter(other => other.id !== row.id)
        return serialize(row, rows)
    }
  }

  return { handle, insert, find: id => rows.find(row => row.id === id) }
}
