
import type { Dispatch } from 'react'
import type { Dictionary } from '@/types.ts'

export type FilterParser = (value: any) => number | null

export type TableFilterProps = {
  filter: TableFilter,
  dispatchFilterChange: Dispatch<FilterAction>,
  onCloseFilter: () => void
}

export type TableFilter = Dictionary<CheckboxesFilter | RangeFilter>

export type CheckboxesFilter = {
  values: string[],
  checked: string[],
  type: 'checkboxes'
}

export type RangeFilter = {
  min?: number | string,
  max?: number | string,
  parser?: FilterParser,
  type: 'range'
}

export type ColumnTogglePayload = { column: string, value: string, selected: boolean }

export type RangeValuePayload = {
  column: string,
  target: 'min' | 'max',
  value: string | number,
  parser?: FilterParser
}

export type FilterAction =
  | { type: 'TOGGLE_COLUMN', payload: ColumnTogglePayload }
  | { type: 'SET_COLUMN_RANGE', payload: RangeValuePayload }
  | { type: 'RESET_FILTER' }

export const isRange = (filter: { type: 'checkboxes' | 'range' }): filter is RangeFilter => filter.type === 'range'

export function assertAsRange(filter: CheckboxesFilter | RangeFilter): asserts filter is RangeFilter {
  if (filter.type !== 'range')
    throw new Error(`Expected filter to be a 'range filter', but is a '${filter.type} filter'`)
}

export function assertAsCheckboxes(filter: CheckboxesFilter | RangeFilter): asserts filter is CheckboxesFilter {
  if (filter.type !== 'checkboxes')
    throw new Error(`Expected filter to be a 'checkboxes filter', but is a '${filter.type} filter'`)
}