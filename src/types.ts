export type PersistedRecord = Entity & { createdAt: string }

export type Entity = { id: number } & Record<string, unknown>

export type Primitive = string | number

export type Pagination = {
  page: number
  pages: number
  count: number
  perPage: number
  next: number | null
  prev: number | null
}

/*
 * The keys a type declares for itself. Plain `keyof` would collapse to the index signature
 * every Entity carries, taking the named keys down with it
 */
type NamedKeys<T> = keyof {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

export type EntityKeys<T> = {
  [K in NamedKeys<T>]: NonNullable<T[K]> extends Entity
    ? K
    : never
}[NamedKeys<T>] & string

export const isString = (value: unknown): value is string => typeof value === 'string'
export const isNumber = (value: unknown): value is number => typeof value === 'number'
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
export const isEntity = (value: object): value is Entity => 'id' in value

export function assertAsArray <T>(type: string, value: unknown): asserts value is T[] {
  if (!Array.isArray(value) || value.some(item => typeof item !== type))
    throw new Error(`Expected value to be a string array, but is a ${typeof value}`)
}