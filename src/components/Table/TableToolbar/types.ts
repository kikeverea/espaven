import type { FilterAction, FilterParser, TableFilter } from '@/components/Table/TableFilter/types.ts'
import type { Dictionary } from '@/types.ts'
import type { Dispatch } from 'react'

export type RangeFilterColumn = [string, 'range', FilterParser?]

export type FilterColumns = (string | RangeFilterColumn)[]

export type TableToolbarProps = {
  collection?: Dictionary<string|number>[]
  search?: string,
  showSearch?: boolean,
  searchPlaceholder?: string,
  filterColumns?: FilterColumns,
  onSearchChange?: (search: string) => void,
  filter?: TableFilter,
  dispatchFilterChange?: Dispatch<FilterAction>,
}