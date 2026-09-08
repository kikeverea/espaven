import { useState } from 'react'
import { normalized } from '@/lib/strings.ts'

export type TableSort = { column: string, direction?: 'asc' | 'desc' }
type SortState = readonly [TableSort | undefined, (headerName: string) => void]

/* Clicking the sorted column flips its direction, any other column starts ascending */
export const nextSort = (sort: TableSort | undefined, headerName: string): TableSort => {
  if (!sort)
    return { column: headerName }

  const isSameColumn = normalized(sort.column) === normalized(headerName)

  return {
    column: headerName,
    direction: isSameColumn
      ? (sort.direction || 'asc') === 'asc' ? 'desc' : 'asc'
      : 'asc'
  }
}

const useSort = (initialSort: TableSort | undefined): SortState => {

  const [sort, setSort] = useState<TableSort | undefined>(initialSort)

  return [sort, (headerName: string) => setSort(nextSort(sort, headerName))]
}

export default useSort
