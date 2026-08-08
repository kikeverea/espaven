import type { TableFilter } from '@/components/Table/TableFilter/types'
import type { DataPresenter, Entity, Primitive } from '@/types.ts'

export type TableColumn<T extends Entity> = {
  name: string,
  data: (item: T) => Primitive | Primitive[],
  presenter?: DataPresenter,
}

export type TableData = RowData[]

export type RowData = Entity & { data: ItemData }

export type ItemData = {
  [column: string]: { value: Primitive | Primitive[], presenter?: DataPresenter }
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
}

export type TableSort = { column: string, direction?: 'asc' | 'desc' }