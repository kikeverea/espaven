import { snakeCaseKeys } from '@/lib/strings.ts'

type UrlValue = string | number | boolean | null | undefined

/* An array goes out as one param per value, Rails style: `checked[]=a&checked[]=b` */
export type UrlParams = Record<string, UrlValue | UrlValue[]>

export const withParams = (path: string, ...params: UrlParams[]): string => {
  const [ base, current ] = path.split('?', 2)
  const search = new URLSearchParams(current)

  for (const urlParams of (params || [])) {
    Object.entries(snakeCaseKeys(urlParams) ?? {}).forEach(([ key, value ]) => {
      const values = (Array.isArray(value) ? value : [value]).filter(hasValue)

      if (!values.length)
        return

      // `set` keeps the key where the path had it, the rest of its values follow
      const [ first, ...rest ] = values
      search.set(key, String(first))
      rest.forEach(value => search.append(key, String(value)))
    })
  }

  const query = search.toString()
  return query ? `${base}?${query}` : base
}

const hasValue = (value: UrlValue): value is string | number | boolean => value != null && value !== ''
