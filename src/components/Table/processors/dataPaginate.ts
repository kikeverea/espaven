import type { TableData, TableQueryState } from '@/components/Table/types'
import type { Entity } from '@/types'

type PageSlice = Pick<TableQueryState, 'page' | 'perPage'>

/*
 * Slices the page out of an already sorted collection. Sorting has to come first:
 * sorting a slice only orders the rows that happened to land on the current page
 */
export const paginateData = <T extends Entity>(
  data: TableData<T>,
  pagination?: PageSlice
): TableData<T> => {
  const [pageStart, pageEnd] = pageRange(pagination, data.length)
  return data.slice(pageStart, pageEnd)
}

/* Pages count from 1, like the api's */
export const pageRange = (
  pagination: PageSlice | undefined,
  collectionLength: number
): readonly [number, number] => {
  if (!pagination)
    return [0, collectionLength]

  const { page, perPage } = pagination
  const startIndex = (page - 1) * perPage

  return [startIndex, startIndex + perPage]
}
