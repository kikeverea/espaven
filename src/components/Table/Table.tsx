import { type ReactNode, useMemo, useState } from 'react'
import { mapToData, filterData } from './processors/dataProcessor'
import useSort from './hooks/useSort'
import usePagination from './hooks/usePagination'
import TablePaginator from '@/components/Table/TablePaginator/TablePaginator'
import { sortAndPaginateData } from './processors/dataSortAndPaginate'
import SortingHeader from '@/components/Table/SortingHeader/SortingHeader'
import { normalized } from '@/lib/strings'
import type { Entity } from '@/types.ts'
import type { RowData, TableColumn, TableData, TableProps } from '@/components/Table/types.ts'
import { Table as ShdcnTable, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { cellPadding } from '@/components/Table/util.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { TableActions } from '@/components/Table/TableActions/TableActions.tsx'

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
  selectable=false,
  onSelectionChange,
  actions
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

  const [selected, setSelected] = useState<T['id'][]>([])

  const selectItem = (item: RowData, select: boolean) => {

    const newSelection = select ?
      [...selected, item.id] :
      selected.filter(selectedId => selectedId !== item.id)

    setSelected(newSelection)
    onSelectionChange?.(newSelection)
  }

  const selectAll = (select: boolean) => {
    const newSelection = select ?
      (collection || []).map(item => item.id) :
      []

    setSelected(newSelection)
    onSelectionChange?.(newSelection)
  }
  const rows = sortAndPaginateData(filteredData, { pagination, sort })


  return (
    <>
      <ShdcnTable>
        <SortingHeader
          columns={ columns }
          sort={ sort }
          setSortColumn={ setSortColumn }
          selectable={ selectable }
          onSelectedChange={ selectAll }
        />
        <TableBody>
          { rows?.length
            ?
            rows.map(item =>
              <TableRow key={ item.id }>
                { selectable &&
                  <TableCell
                    key={`${item.id}-select`}
                    className={`ps-5 max-w-8 w-8 xl:max-w-6.25 xl:w-w-6.25`}
                  >
                    <Checkbox
                      onCheckedChange={(checked) => selectItem(item, checked)}
                      checked={ selected.includes(item.id)}
                      className='data-checked:bg-blue-500 data-checked:border-blue-500'
                    />
                  </TableCell>
                }
                { columns.map(column =>
                  <TableCell
                    key={`${item.id}-${column.name || column.key}`}
                    className={`${cellPadding()} text-gray-800`}
                  >
                    { cellValue(column, item) }
                  </TableCell>
                )}
                { actions &&
                  <TableCell className={`pe-5 max-w-8 w-8 xl:max-w-6.25 xl:w-w-6.25`}>
                    <TableActions actions={ actions } item={ item } />
                  </TableCell>
                }
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

const cellValue = <T extends Entity> (column: TableColumn<T>, item: RowData): ReactNode => {
  if (column.component)
    return column.component()


  const data = item.data[normalized(column.name)]
  return column.presenter ? column.presenter(data.value) : String(data.value ?? '-')
}

export default Table