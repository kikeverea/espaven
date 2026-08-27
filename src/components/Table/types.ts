import type { TableFilter } from '@/components/Table/TableFilter/types'
import type { DataPresenter, Entity, Primitive } from '@/types.ts'
import type { ReactElement, ReactNode } from 'react'
import type { UseMutateFunction } from '@tanstack/react-query'
import type { ButtonVariants } from '@/components/ui/button.tsx'

type StandardTableColumn<T extends Entity> = {
  name: string
  accessor: keyof T | ((item: T) => Primitive | Primitive[])
  blink?: (item: T) => boolean
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

export type RowData = { id: Entity['id'], data: ItemData, blink?: boolean}

export type ItemData = {
  [column: string]: { value: Primitive | Primitive[], presenter?: DataPresenter, blink?: boolean }
}

export type TableAction = {
  label: string,
  path: (item: RowData) => string,
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
  selectionActions?: SelectionAction<T>[],
  selectedId?: Entity['id']
  blink?: (item: T) => boolean
}

export type TableSort = { column: string, direction?: 'asc' | 'desc' }