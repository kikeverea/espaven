import { camelize, snakeCase } from '@/lib/strings.ts'
import { type ForbiddenApiFields, prepareForApi } from '@/api/entity.mapper.ts'
import type { Entity } from '@/types.ts'

const API_URL = import.meta.env.API_URL ?? "http://localhost:3000"

export type ApiMapper<TDomain extends Entity, TApiIn, TApiOut extends object & ForbiddenApiFields> = {
  toApi?: (domain: Partial<TDomain>) => TApiOut
  fromApi?: (api: TApiIn) => TDomain
}

type RequestOptions<TDomain> = Omit<RequestInit, 'body'> & { body?: Partial<TDomain> }

export function api<
  TDomain extends Entity, TApiIn, TApiOut extends object & ForbiddenApiFields
>
  (mapper?: ApiMapper<TDomain, TApiIn, TApiOut>)
{
  const toApi = mapper?.toApi ?? prepareForApi<TDomain, TApiOut>
  const fromApi = mapper?.fromApi

  return async function apiFetch<O = TDomain>(
    path: string,
    options: RequestOptions<TDomain> = {},
  ): Promise<O> {

    const requestOptions = options.body
      ? {
          ...options,
          body: JSON.stringify(mapToApi(options.body, toApi))
        }
      : options as RequestInit

    const res = await fetch(`${API_URL}/api${path}`, {
      ...requestOptions,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        ...options.headers
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(`API error: ${res.status}. ${error.exception}`)
    }

    if (res.status === 204)
      return true as O

    const json = await res.json()

    return mapFromApi(json, fromApi) as O
  }
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

  if (isDataObject(data)) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        keyMapper(key),
        mapKeys(value, keyMapper),
      ]),
    )
  }

  return data
}

function isDataObject(data: unknown): data is object {
  return data !== null && typeof data === 'object'
}