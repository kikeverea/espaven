import type { TableData } from '@/components/Table/types'
import type { ClientPagination } from '@/components/Table/hooks/usePagination'
import type { Entity } from '@/types'

/*
 * Slices the page out of an already sorted collection. Sorting has to come first:
 * sorting a slice only orders the rows that happened to land on the current page
 */
export const paginateData = <T extends Entity>(
  data: TableData<T>,
  pagination?: ClientPagination
): TableData<T> => {
  const [pageStart, pageEnd] = pageRange(pagination, data.length)
  return data.slice(pageStart, pageEnd)
}

export const pageRange = (
  pagination: ClientPagination | undefined,
  collectionLength: number
): readonly [number, number] => {
  if (!pagination)
    return [0, collectionLength]

  const { page = 0, itemsPerPage } = pagination
  const startIndex = page * itemsPerPage

  return [startIndex, startIndex + itemsPerPage]
}
