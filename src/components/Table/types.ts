import type { Entity, Pagination, Primitive } from '@/types'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import type { UseMutateFunction } from '@tanstack/react-query'
import type { ButtonVariants } from '@/components/ui/button'
import type { TableFilter } from '@/components/Table/TableFilter/types.ts'

/*
 * `key` names the column everywhere but its header: in each row's data, in sorts and filters, and to the
 * collection's source, which gets it snake cased. A column that shows a field as it is needs no accessor
 */
export type StandardTableColumn<T extends Entity> = ColumnAccess<T> & {
  name: string
  blink?: (item: T) => boolean
  presenter?: DataPresenter<T>
  className?: string
  headerClassName?: string
  onClick?: (id: number) => void
  link?: (id: number) => string

  header?: never
  component?: never
}

type ColumnAccess<T extends Entity> =
  | { key: Extract<keyof T, string>, accessor?: never }
  | { key: string, accessor: (item: T) => Primitive | Primitive[] }

export type CustomTableColumn = {
  header: () => ReactNode
  component: () => ReactNode
  key: string | number

  name?: never
  accessor?: never
  presenter?: never
  className?: never
  headerClassName?: never
}

export const isCustomCol = (col: TableColumn<any>): col is CustomTableColumn => !!col.component

export type TableColumn<T extends Entity> =
  | StandardTableColumn<T>
  | CustomTableColumn

export type TableData<T extends Entity> = RowData<T>[]

export type RowData<T extends Entity> = { id: Entity['id'], entity: T, data: ItemData<T>, blink?: boolean}

export type ItemData<T extends Entity> = {
  [column: string]: { value: Primitive | Primitive[], presenter?: DataPresenter<T>, blink?: boolean }
}

export type DataPresenter<T extends Entity> = (value: any, original: T) => ReactNode

export type TableAction = {
  label: string,
  action: (id: RowData<any>['id']) => void,
  icon?: ReactElement,
  destructive?: boolean
}

export type SelectionAction<T extends Entity> = {
  icon: ReactElement,
  mutation: UseMutateFunction<boolean[], Error | null, T['id'][]>,
  onSuccess: () => void
  destructive?: boolean
  variant?: ButtonVariants
}

/* What narrows a collection down to the rows on screen, and the page it is on. Pages count from 1 */
export type TableQueryState = {
  page: number
  perPage: number
  search: string
  sort?: TableSort
  filter: TableFilter
}

/*
 * A 'server' query is applied by whoever fetches the collection: the Table shows the rows as they come.
 * A 'local' one is applied by the Table itself, on a collection it holds in full
 */
export type TableQuery = TableQueryState & {
  mode: 'local' | 'server'
  setPage: (page: number) => void
  setPerPage: (perPage: number) => void
  setSearch: (search: string) => void
  setSort: (sort: TableSort) => void
  setFilter: (filter: TableFilter) => void
}

export type TableProps<T extends Entity> = ComponentProps<"div"> & {
  collection?: T[]
  pagination?: Pagination
  tableQuery?: TableQuery
  columns: TableColumn<T>[]
  loadingMessage?: string
  noEntriesMessage?: string
  selectable?: boolean
  onSelectionChange?: (selection: T['id'][]) => void
  actions?: TableAction[]
  selectionActions?: SelectionAction<T>[]
  selectedId?: Entity['id'] | null
  blink?: (item: T) => boolean
  isLoading?: boolean
}

/* `column` is the sorted column's key */
export type TableSort = { column: string, direction?: 'asc' | 'desc' }