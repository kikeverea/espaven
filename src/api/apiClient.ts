import { camelize, snakeCase } from '@/lib/strings.ts'
import { type ForbiddenApiFields, prepareForApi } from '@/api/entity.mapper.ts'
import type { Entity, PersistedRecord } from '@/types.ts'

const API_URL = import.meta.env.API_URL ?? "http://localhost:3000"

export type ApiMapper<TDomain extends Entity, TApiIn, TApiOut extends object & ForbiddenApiFields> = {
  toApi?: (domain: Partial<TDomain>) => TApiOut
  fromApi?: (api: TApiIn) => TDomain
}

type ApiBody<T> = { body?: T }
type ApiOptions<T> = Omit<RequestInit, 'body'> & ApiBody<T>

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