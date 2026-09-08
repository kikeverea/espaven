import { camelize, snakeCase } from '@/lib/strings.ts'
import { type ForbiddenApiFields, prepareForApi } from '@/api/entity.mapper.ts'
import type { Entity, PersistedRecord } from '@/types.ts'
import type { EntityCollection } from '@/components/Table/useCollection.tsx'

const API_URL = import.meta.env.API_URL ?? "http://localhost:3000"

export type ApiMapper<TDomain extends Entity, TApiIn, TApiOut extends object & ForbiddenApiFields> = {
  toApi?: (domain: Partial<TDomain>) => TApiOut
  fromApi?: (api: TApiIn) => TDomain
}

type ApiBody<T> = { body?: T }
type ApiOptions<T> = Omit<RequestInit, 'body'> & ApiBody<T>

export type CollectionQuery = {
  page?: number
  perPage?: number
  search?: string
  sort?: { key?: string, column: string, direction?: 'asc' | 'desc' }
}

export const collectionQuery = (query?: CollectionQuery): string => {
  const params = new URLSearchParams()

  if (query?.page)
    params.set('page', String(query.page))

  if (query?.perPage)
    params.set('per_page', String(query.perPage))

  const search = query?.search?.trim()

  if (search)
    params.set('search', search)

  const sort = query?.sort
  const sortColumn = sort?.key ?? sort?.column

  if (sortColumn) {
    params.set('sort', sortColumn)
    params.set('direction', sort?.direction ?? 'asc')
  }

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

export function api<
  TDomain extends PersistedRecord, TApiIn, TApiOut extends object & ForbiddenApiFields
>
  (mapper?: ApiMapper<TDomain, TApiIn, TApiOut>)
{
  const toApi = mapper?.toApi ?? prepareForApi<TDomain, TApiOut>
  const fromApi = mapper?.fromApi

  const apiFetch = async <O = TDomain>(
    path: string,
    options: ApiOptions<Partial<TDomain>> = {},
  ): Promise<O> =>
  {
    const requestOptions = normalizeBody(options, body => mapToApi(body, toApi))

    const json = await doFetch(`${API_URL}/api${path}`, requestOptions, options.headers)
    return mapFromApi(json, fromApi) as O
  }

  const simpleFetch = async <T>(path: string, options: ApiOptions<object> = {}): Promise<T> => {
    const requestOptions = normalizeBody(options, body => mapKeys(body, snakeCase))

    const json = await doFetch(`${API_URL}/api${path}`, requestOptions, options.headers)
    return (isObject(json) ? mapKeys(json, camelize) : json) as T
  }

  return { apiFetch, fetch: simpleFetch }
}

function mapToApi<IN, OUT>(data: IN, mapper?: (data: IN) => OUT): unknown {
  if (Array.isArray(data))
    return data.map(item => mapToApi(item, mapper))

  const normalized = mapper ? mapper(data) : data
  return mapKeys(normalized, snakeCase)
}

function mapFromApi<IN, OUT>(data: unknown, mapper?: (data: IN) => OUT): unknown | OUT {
  if (Array.isArray(data))
    return data.map(item => mapFromApi(item, mapper))

  if (isEntityCollection(data)) {
    const { collection, ...meta } = data
    return {
      ...mapKeys(meta, camelize) as object,
      collection: collection.map(item => mapFromApi(item, mapper)),
    }
  }

  const normalized = mapKeys(data, camelize) as IN
  return mapper ? mapper(normalized) : normalized
}

function mapKeys(
  data: unknown,
  keyMapper: (s: string) => string,
): unknown {
  if (Array.isArray(data))
    return data.map(item => mapKeys(item, keyMapper))

  if (isObject(data)) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        keyMapper(key),
        mapKeys(value, keyMapper),
      ]),
    )
  }

  return data
}

function isObject(data: unknown): data is object {
  return data !== null && typeof data === "object" && !Array.isArray(data)
}

function isEntityCollection(data: unknown): data is EntityCollection<Entity> {
  return isObject(data) && 'collection' in data && Array.isArray(data.collection)
}

function normalizeBody<T>(options: ApiOptions<T>, mapper: ((o: T) => unknown)): RequestInit {
  const body = options.body

  return isObject(body)
    ? {
      ...options,
      body: JSON.stringify(mapper(body))
    }
    : options as RequestInit
}

async function doFetch(path: string, options: RequestInit, headers: HeadersInit = {}): Promise<any> {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
      ...headers
    },
  })

  if (res.status === 204)
    return true

  if (!res.ok) {
    const error = await res.json()

    console.log(error)

    const message = error.exception
      ? error.exception
      : Object.entries(error)
        .flatMap(([field, messages]) =>
          (messages as string[]).map(message => `${field} ${message}`)
        )
        .join(', ')

    throw new Error(`API error: ${res.status}. ${message}`)
  }

  return await res.json()
}