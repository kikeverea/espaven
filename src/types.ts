import type { ReactNode } from 'react'

export type Record = { createdAt: string }
export type Entity = Record & { id: number }
export type Primitive = string | number
export type DataPresenter = (value: any) => ReactNode

export type Dictionary<T> = { [key: string]: T}

export type EntityKeys<T> = {
  [K in keyof T]:
  NonNullable<T[K]> extends Entity
    ? K
    : never
}[keyof T] & string

export const isString = (value: unknown): value is string => typeof value === 'string'
export const isNumber = (value: unknown): value is number => typeof value === 'number'
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
export const isEntity = (value: object): value is Entity => 'id' in value

export function assertAsArray <T>(type: string, value: unknown): asserts value is T[] {
  if (!Array.isArray(value) || value.some(item => typeof item !== type))
    throw new Error(`Expected value to be a string array, but is a ${typeof value}`)
}