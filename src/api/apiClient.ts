import { camelize, snakeCase } from '@/lib/strings.ts'
import type { Entity } from '@/types.ts'

const API_URL = import.meta.env.API_URL ?? "http://localhost:3000"

export type ApiMapper<TDomain, TApi> = {
  toApi?: (domain: TDomain) => TApi
  fromApi?: (api: TApi) => TDomain
}

type RequestOptions<TApi> = Omit<RequestInit, 'body'> & { body?: TApi }

type DomainEntity = Entity
type ApiEntity = { [k: string]: any }

export function api<TDomain extends DomainEntity, TApi extends ApiEntity>(mapper: ApiMapper<TDomain, TApi>) {
  const toApi = mapper.toApi
  const fromApi = mapper.fromApi

  return async function apiFetch<T>(
    path: string,
    options: RequestOptions<T> = {},
  ): Promise<T> {

    const requestOptions = options.body ?
      { ...options, body: mapApiData(options.body, snakeCase, toApi) as BodyInit } :
      options as RequestInit

    const res = await fetch(`${API_URL}/api${path}`, {
      ...requestOptions,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        ...options.headers, // allow overrides
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(`API error: ${res.status}. ${error.exception}`)
    }

    if (res.status === 204)
      return true as T

    const json = await res.json()

    return mapApiData(json, camelize, fromApi) as T
  }
}

function mapApiData<IN, OUT>(
  data: unknown,
  keyMapper: (s: string) => string,
  modelMapper?: ((obj: IN) => OUT)
): unknown {

  if (!modelMapper)
    return data

  if (Array.isArray(data))
    return data.map(data => mapApiData(data, keyMapper, modelMapper))

  if (isDataObject<IN>(data))
    return mapApiEntity(data, keyMapper, modelMapper)

  return data
}


function mapApiEntity<IN, OUT>(
  data: IN,
  keyMapper: (s: string) => string,
  modelMapper: ((data: IN) => OUT)
): OUT {

  const normalized = Object.fromEntries(
    Object.entries(data as object).map(([key, value]) => [
      keyMapper(key),
      mapApiData(value, keyMapper, modelMapper),
    ])
  )

  return modelMapper ? modelMapper(normalized as IN) : normalized as OUT
}

function isDataObject<D>(data: unknown): data is D {
  return data !== null && typeof data === 'object'
}