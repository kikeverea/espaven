import {useState} from 'react'
import { normalized } from '@/lib/strings.ts'

export type TableSort = { column: string, direction?: 'asc' | 'desc' }
type SortState = readonly [TableSort | undefined, (headerName: string) => void]

const useSort = (initialSort: TableSort | undefined): SortState => {

  const [sort, setSort] = useState<TableSort | undefined>(initialSort)

  const handleSortChange = (headerName: string): void => {
    if (!sort) {
      setSort({ column: headerName })
      return
    }

    const isSameColumn = normalized(sort.column) === normalized(headerName)

    const direction = isSameColumn
      ? (sort.direction || 'asc') === 'asc' ? 'desc' : 'asc'
      : 'asc'

    setSort({ column: headerName, direction: direction })
  }

  return [sort, handleSortChange]
}

export default useSort