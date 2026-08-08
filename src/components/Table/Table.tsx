import type { ReactNode } from 'react'
import {isValidElement, useMemo} from 'react'
import {mapToData, filterData} from './processors/dataProcessor'
import useSort from './hooks/useSort'
import usePagination from './hooks/usePagination'
import TablePaginator from '@/components/Table/TablePaginator/TablePaginator'
import {sortAndPaginateData} from './processors/dataSortAndPaginate'
import SortingHeader from '@/components/Table/SortingHeader/SortingHeader'
import {normalized} from '@/lib/strings'
import type { Entity } from '@/types.ts'
import type { TableData, TableProps } from '@/components/Table/types.ts'
import { Table as ShdcnTable, TableBody, TableRow, TableCell } from '@/components/ui/table'

const Table = <T extends Entity>(
{
  collection,
  columns,
  search,
  filter,
  sortBy,
  paginate,
  page: currentPage,
  noEntriesMessage,
}: TableProps<T>) => {

  const tableData = useMemo<TableData>(
    () => mapToData(collection, columns),
    [collection, columns]
  )

  const filteredData = useMemo<TableData>(
    () => filterData(tableData, { search, filter }),
    [tableData, search, filter]
  )

  const [sort, setSortColumn] = useSort(sortBy)
  const [pagination, setItemsPerPage, setPage] = usePagination(paginate, currentPage || 0)

  const rows = sortAndPaginateData(filteredData, { pagination, sort })

  return (
    <>
      <ShdcnTable>
        <SortingHeader
          columns={ columns }
          sort={ sort }
          setSortColumn={ setSortColumn }
        />
        <TableBody>
          { rows?.length
            ? rows.map(item =>
              <TableRow key={ item.id }>
                { columns.map(column => {

                  const data = item.data[normalized(column.name)]
                  const displayValue = data.presenter ? data.presenter(data.value) : String(data.value ?? '-')
                  const valueSize = determineValueSize(displayValue)

                  return (
                    <TableCell key={`${item.id}-${column.name}`}>
                      <div className={ valueSize }>
                        { displayValue }
                      </div>
                    </TableCell>
                  )
                })}
              </TableRow>
            )
            : <TableRow key='empty-message'>
                <td>{ noEntriesMessage || 'No data available' }</td>
              </TableRow>
          }
        </TableBody>
      </ShdcnTable>
      {
        pagination && collection &&
        <TablePaginator
          pagination={ pagination }
          setPage={ setPage }
          setItemsPerPage={ setItemsPerPage }
          collection={ collection }
        />
      }
    </>
  )
}

const extractValue = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number')
    return String(node)

  if (Array.isArray(node))
    return node.map(extractValue).join('')

  if (isValidElement<{ children?: ReactNode }>(node))
    return extractValue(node.props.children)

  return ''
}

const determineValueSize = (node: ReactNode) => {
  const value: string = extractValue(node)
  const valueLength = value.length

  if (valueLength < 3)
    return "min-w-15"

  if (valueLength < 11)
    return "min-w-30"

  if (valueLength < 21)
    return "min-w-45"

  return "min-w-75"
}

export default Table