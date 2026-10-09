import type { TableFilter } from '@/components/Table/TableFilter/types'
import type { Entity, Pagination, Primitive } from '@/types.ts'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import type { UseMutateFunction } from '@tanstack/react-query'
import type { ButtonVariants } from '@/components/ui/button.tsx'

export type StandardTableColumn<T extends Entity> = {
  name: string
  accessor: keyof T | ((item: T) => Primitive | Primitive[])
  sortKey?: string            // what the api calls this column, when it is the one sorting
  blink?: (item: T) => boolean
  presenter?: DataPresenter<T>
  className?: string
  headerClassName?: string
  onClick?: (id: number) => void
  link?: (id: number) => string

  key?: never
  header?: never
  component?: never
}

export type CustomTableColumn = {
  header: () => ReactNode
  component: () => ReactNode
  key: string | number

  name?: never
  accessor?: never
  sortKey?: never
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

export type ServerTable = {
  pagination?: Pagination
  sort?: TableSort
  search: string
  setPage: (page: number) => void
  setPerPage: (perPage: number) => void
  setSearch: (search: string) => void
  setSort: (sort: TableSort) => void
}

type BaseTableProps<T extends Entity> = ComponentProps<"div"> & {
  collection?: T[]
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

type ClientModeProps = {
  server?: never
  search?: string
  filter?: TableFilter
  sortBy?: TableSort
  paginate?: number
  page?: number
}

type ServerModeProps = {
  server?: ServerTable
  search?: never
  filter?: never
  sortBy?: never
  paginate?: never
  page?: never
}

export type TableProps<T extends Entity> = BaseTableProps<T> & (ClientModeProps | ServerModeProps)

export type TableSort = { column: string, direction?: 'asc' | 'desc', key?: string }