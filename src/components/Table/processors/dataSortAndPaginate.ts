import type { ItemData, TableData, TableSort } from '@/components/Table/types'
import type { Pagination } from '@/components/Table/TablePaginator/types'
import { type Entity, isBoolean, isNumber, isString } from '@/types'
import { normalized } from '@/lib/strings'

type SortAndPaginateDataArgs = {
  pagination?: Pagination,
  sort?: TableSort
}

export const sortAndPaginateData = <T extends Entity>(
  data: TableData<T>,
  args: SortAndPaginateDataArgs
): TableData<T> => {

  const [ pageStart, pageEnd ] = pageRange(args.pagination, data.length)

  return data.length
    ? data
      .slice(pageStart, pageEnd)      // paginate
      .sort((item1, item2) => applySort(item1.data, item2.data, args.sort))
    : data
}

const applySort = <T extends Entity>(
  item1: ItemData<T>,
  item2: ItemData<T>,
  sort?: TableSort,
): number => {

  if (!sort)
    return 0

  const column = normalized(sort.column)

  const value1 = item1[column].value
  const value2 = item2[column].value
  const direction = sort.direction || 'asc'

  const areStrings = isString(value1) && isString(value2)
  const areNumbers = isNumber(value1) && isNumber(value2)
  const areBooleans = isBoolean(value1) && isBoolean(value2)

  if (areStrings)
    return direction === 'asc'
      ? value1.localeCompare(value2)
      : value2.localeCompare(value1)

  else if (areNumbers)
    return direction === 'asc'
      ? value1 - value2
      : value2 - value1

  else if (areBooleans) {
    return direction === 'asc'
      ? Number(value2) - Number(value1)
      : Number(value2) - Number(value1)
  }
  else return 1
}

export const pageRange = (pagination: Pagination | undefined, collectionLength: number): readonly [number, number]=> {
  if (!pagination)
    return [ 0, collectionLength]

  const { page=0, itemsPerPage } = pagination

  const startIndex = page * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  return [startIndex, endIndex]
}