import type { TableFilter } from '@/components/Table/TableFilter/types'
import type { DataPresenter, Entity, Primitive } from '@/types.ts'
import type { ReactElement, ReactNode } from 'react'

type StandardTableColumn<T extends Entity> = {
  name: string
  accessor: keyof T | ((item: T) => Primitive | Primitive[])
  presenter?: DataPresenter
  onClick?: (id: number) => void

  key?: never
  header?: never
  component?: never
}

type CustomTableColumn = {
  header: () => ReactNode
  component: () => ReactNode
  key: string | number

  name?: never
  accessor?: never
  presenter?: never
}

export const isCustomCol = (col: TableColumn<any>): col is CustomTableColumn => !!col.component

export type TableColumn<T extends Entity> =
  | StandardTableColumn<T>
  | CustomTableColumn

export type TableData = RowData[]

export type RowData = { id: Entity['id'], data: ItemData }

export type ItemData = {
  [column: string]: { value: Primitive | Primitive[], presenter?: DataPresenter }
}

export type TableAction = {
  label: string,
  path: (item: RowData) => string,
  icon?: ReactElement,
  destructive?: boolean
}

export type TableProps<T extends Entity> = {
  collection?: T[]
  columns: TableColumn<T>[],
  search?: string,
  filter?: TableFilter,
  sortBy?: TableSort,
  noEntriesMessage?: string,
  paginate?: number,
  page?: number,
  selectable?: boolean,
  onSelectionChange?: (selection: T['id'][]) => void,
  actions?: TableAction[],
  selectedId?: Entity['id']
}

export type TableSort = { column: string, direction?: 'asc' | 'desc' }