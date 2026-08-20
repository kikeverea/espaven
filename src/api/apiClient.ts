import { camelize } from '@/lib/strings.ts'

const API_URL = import.meta.env.API_URL ?? "http://localhost:3000"

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {

  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
      ...options.headers, // allow overrides
    },
  })

  if (!res.ok) {
    const error = await res.json()
    console.error(error)
    throw new Error(`API error: ${res.status}. ${error.exception}`)
  }

  if (res.status === 204)
    return true as T

  const json = await res.json()
  return mapToJS(json) as T
}

function mapToJS(data: unknown): unknown {
  if (Array.isArray(data))
    return data.map(mapToJS)

  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        camelize(key),
        mapToJS(value),
      ]),
    )
  }

  return data
}