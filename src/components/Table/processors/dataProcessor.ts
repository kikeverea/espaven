import type { TableColumn, ItemData, TableData } from '../types'
import {
  type CheckboxesFilter,
  isRange,
  type RangeFilter,
  type TableFilter
} from '@/components/Table/TableFilter/types'
import { type Entity, isBoolean, isString, type Primitive } from '@/types.ts'
import { normalized, normalizedValue } from '@/lib/strings.ts'

type FilterDataArgs = {
  search?: string,
  filter?: TableFilter
}

export const mapToData = <T extends Entity>(collection: T[] = [], columns: TableColumn<T>[]): TableData => {

  return collection.map(item => {

    const data = columns.reduce((data, column) => {
      const columnName = normalized(column.name)
      const columnData = typeof column.accessor === 'function' ? column.accessor(item) : String(item[column.accessor])
      data[columnName] = { value: columnData, presenter: column.presenter }

      return data
    }, {} as ItemData)

    return { id: item.id, data }
  })
}

export const filterData = (collection: TableData = [], args: FilterDataArgs): TableData => {
  const normalizedFilter = args.filter && normalizeFilter(args.filter)
  return collection.filter(item => applySearchAndFilter(item.data, args.search, normalizedFilter))
}

const applySearchAndFilter = (
  item: ItemData,
  search?: string,
  filter?: TableFilter
): boolean => {

  if (!search && !filter)
    return true

  let passesFilter = true
  let passesSearch = !search

  for (const [column, { value }] of Object.entries(item)) {
    passesFilter = !filter || (passesFilter && evaluateFilter(filter, column, value))
    passesSearch = !search || passesSearch || evaluateSearch(search, value)
  }

  return passesFilter && passesSearch
}

const evaluateSearch = (search: string, value: Primitive | Primitive[]) => {
  return normalizedValue(value).includes(normalized(search))
}

const evaluateFilter = (filter: TableFilter | undefined, columnName: string, value: Primitive | Primitive[]): boolean => {

  return Array.isArray(value)
    ? value.every(value => evaluateFilterWithValue(filter, columnName, value))
    : evaluateFilterWithValue(filter, columnName, value)
}

const evaluateFilterWithValue = (filter: TableFilter | undefined, columnName: string, value: Primitive): boolean => {

  const columnFilter = filter?.[columnName]

  if (!columnFilter)
    return true

  const filterIsRange = isRange(columnFilter)

  return filterIsRange
    ? evaluateRangeFilter(columnFilter, value)
    : evaluateCheckboxesFilter(columnFilter, value)
}

const evaluateRangeFilter = (filter: RangeFilter, primitiveValue: Primitive): boolean => {
  const value = asNumber(primitiveValue)
  const hasLimits = 'min' in filter || 'max' in filter

  if (!value || !hasLimits)
    return true

  const parser = filter.parser

  const min = parser ? parser(filter.min) : asNumber(filter.min)
  const max = parser ? parser(filter.max) : asNumber(filter.max)

  const hasMin = numberPresent(min)
  const hasMax = numberPresent(max)

  if (hasMin && hasMax)
    return value >= min && value <= max

  else if (hasMin)
    return value >= min

  else if (hasMax)
    return value <= max

  else return true
}

const evaluateCheckboxesFilter = (filter: CheckboxesFilter, value: Primitive): boolean => {
  const checked = filter.checked

  if (!checked.length)
    return true

  if (typeof value !== 'string')
    throw new Error('checkbox filter column names must be strings')

  return checked.some((checked) => checked === normalized(value))
}

const asNumber = (value: string | number | undefined): number | null => {
  if (!value)
    return null

  if (isBoolean(value))
    return value ? 1 : 0

  if (isString(value))
    return parseFloat(value)

  return value
}

const numberPresent = (value: number | null): value is number =>
  value !== undefined && value !== null && String(value).trim() !== ''

export const normalizeFilter = (filter: TableFilter): TableFilter => {
  return Object
    .entries(filter)
    .reduce(
      (normalizedFilter: TableFilter, [ key, value ]: [string, any]): TableFilter => {
        normalizedFilter[normalized(key)] = value
        return normalizedFilter
      },
      {}
    )
}