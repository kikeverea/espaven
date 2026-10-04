import { snakeCaseKeys } from '@/lib/strings.ts'

export type UrlParams = Record<string, string | number | boolean | null | undefined>

export const withParams = (path: string, ...params: UrlParams[]): string => {
  const [ base, current ] = path.split('?', 2)
  const search = new URLSearchParams(current)

  for (const urlParams of (params || [])) {
    Object.entries(snakeCaseKeys(urlParams) ?? {}).forEach(([ key, value ]) => {
      if (value != null && value !== '')
        search.set(key, String(value))
    })
  }


  const query = search.toString()
  return query ? `${base}?${query}` : base
}
