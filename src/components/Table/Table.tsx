import { type ReactNode, useMemo, useReducer, useState } from 'react'
import { mapToData, filterData } from './processors/dataProcessor'
import useSort, { nextSort } from './hooks/useSort'
import usePagination from './hooks/usePagination'
import TablePaginator from '@/components/Table/TablePaginator/TablePaginator'
import TableToolbar from '@/components/Table/TableToolbar/TableToolbar'
import useDebouncedCallback from '@/components/Table/hooks/useDebouncedCallback'
import { sortData } from './processors/dataSort'
import { paginateData } from './processors/dataPaginate'
import SortingHeader from '@/components/Table/SortingHeader/SortingHeader'
import { normalized } from '@/lib/strings'
import type { Entity } from '@/types.ts'
import {
  isCustomCol,
  type RowData,
  type TableColumn,
  type TableData,
  type TableProps
} from '@/components/Table/types.ts'
import { Table as ShdcnTable, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { cellPadding } from '@/components/Table/util.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { TableActions } from '@/components/Table/TableActions/TableActions.tsx'
import { SquareArrowOutUpRight, X } from 'lucide-react'
import selectionReducer, { type SelectionTypes } from '@/components/Table/reducers/selectionReducer'
import TableSkeleton from '@/components/Table/TableSkeleton.tsx'
import Blinker from '@/components/Blinker/Blinker.tsx'
import ClickableCell from '@/components/Table/ClickableCell/ClickableCell.tsx'

const Table = <T extends Entity>(
{
  collection=[],
  server,
  columns,
  search,
  filter,
  sortBy,
  paginate,
  page: initialPage,
  noEntriesMessage,
  selectable=false,
  onSelectionChange,
  selectedId,
  actions,
  selectionActions,
  blink,
  isLoading,
  ...props
}: TableProps<T>) => {

  const [searchTerm, setSearchTerm] = useState(server?.search ?? search ?? '')
  const [internalSort, setInternalSortColumn] = useSort(sortBy)
  const [clientPagination, setItemsPerPage, setPage] = usePagination(paginate, initialPage || 0)
  const [selection, dispatchSelection] = useReducer(selectionReducer<T>, [] as T['id'][])

  const tableData = useMemo<TableData<T>>(
    () => mapToData(collection, columns, blink),
    [collection, columns]
  )

  // in server mode the api already searched
  const filteredData = useMemo<TableData<T>>(
    () => server ? tableData : filterData(tableData, { search: searchTerm, filter }),
    [tableData, searchTerm, filter, server]
  )

  // in server mode the api sorted and sliced the rows already
  const sort = server ? server.sort : internalSort

  const setSortColumn = server
    ? (columnName: string) => server.setSort({ ...nextSort(server.sort, columnName), key: sortKeyOf(columns, columnName) })
    : setInternalSortColumn

  // typing stays instant; only the request waits for the term to settle
  useDebouncedCallback(searchTerm, SEARCH_DEBOUNCE_MS, term => server?.setSearch(term))

  if (isLoading)
    return <TableSkeleton colCount={ columns.length }/>

  // the api knows how many rows there are in total, a client mode table has them all in hand
  const recordCount = server?.pagination?.count ?? collection.length
  const showToolbar = !!server || recordCount > SEARCH_THRESHOLD

  const applySelection = (type: SelectionTypes, isSelected: boolean, item?: RowData<T>) => {
    const action = type === 'SELECT_ALL'
      ? { type, payload: { ids: collection.map(item => item.id), isSelected} }
      : { type, payload: { id: item?.id || 0, isSelected} }

    dispatchSelection(action)
    onSelectionChange?.(selectionReducer(selection, action))
  }

  // sort before slicing: sorting a slice only orders the rows already on the page
  const rows = server
    ? filteredData
    : paginateData(sortData(filteredData, sort), clientPagination)
  const hasActions = !!actions || !!selectionActions

  return (
    <div className={`rounded-lg border overflow-hidden bg-background ${props.className}`}>
      { showToolbar &&
        <TableToolbar
          search={ searchTerm }
          searchPlaceholder='Buscar'
          onSearchChange={ setSearchTerm }
        />
      }
      <ShdcnTable className='text-[13px]'>
        <SortingHeader
          columns={ columns }
          sort={ sort }
          setSortColumn={ setSortColumn }
          selectable={ selectable }
          onSelectedChange={ isSelected => applySelection('SELECT_ALL', isSelected) }
          selection={ selection }
          hasActions={ hasActions }
          selectionActions={ selectionActions }
        />
        <TableBody>
          { rows?.length
            ?
            rows.map(row => {
              const id = row.id
              return (
                <TableRow key={ id }>
                  { selectable &&
                    <TableCell
                      key={`${id}-select`}
                      // percentage-width columns are treated differently in the table auto layout leftover-space
                      // redistribution step: they're excluded from getting extra space, unlike plain pixel-width columns
                      className={`
                        w-[1%] ps-8 whitespace-nowrap
                        ${id === selectedId ? 'bg-slate-100' : ''}
                        ${row.blink ? 'relative' : ''}`
                      }
                    >
                      { row.blink && <Blinker className='absolute left-3 top-5.5' /> }
                      <Checkbox
                        onCheckedChange={(checked) => applySelection('SELECT_ITEM', checked, row)}
                        checked={ selection.includes(id)}
                        className='data-checked:bg-blue-500 data-checked:border-blue-500 cursor-pointer'
                      />
                    </TableCell>
                  }
                  { columns.map((column, ind) => {

                    const isCustom = isCustomCol(column)

                    return (
                      <TableCell
                        key={`${id}-${column.name || column.key}`}
                        className={`
                          ${cellPadding()}
                          ${!selectable && ind === 0 && row.blink ? 'relative' : ''}
                          ${id === selectedId ? 'bg-slate-100' : ''} text-gray-800
                          ${!isCustom && column.onClick && 'cursor-pointer group'}
                          ${ind === columns.length - 1 && !hasActions ? 'pe-8' : ''}
                        `}
                        onClick={ isCustom ? undefined : () => column.onClick?.(id) }
                      >
                        { !selectable && ind === 0 && row.blink &&
                          <Blinker className='absolute left-3 top-5.5' />
                        }
                        { !isCustom && (column.onClick || column.link)
                          ? <ClickableCell link={ column.link?.(id) }>
                              <div className='flex items-center gap-2 w-full text-blue-500'>
                                { cellValue(column, row) }
                                { selectedId === id
                                  ? <X className='invisible size-3.5 group-hover:visible'/>
                                  : <SquareArrowOutUpRight className='invisible size-3.5 group-hover:visible'/>
                                }
                              </div>
                            </ClickableCell>
                          : <div className={`${column.className || ''}`}>
                              { cellValue(column, row) }
                            </div>
                        }
                      </TableCell>
                    )
                  })}
                  { actions &&
                    <TableCell className={`text-end pe-5 max-w-8 w-8 xl:max-w-6.25 xl:w-w-6.25 ${id === selectedId ? 'bg-slate-100' : ''}`}>
                      <TableActions actions={ actions } row={ row } />
                    </TableCell>
                  }
                </TableRow>
              )
            })
            : <TableRow key='empty-message'>
                <td
                  className='text-center py-4 text-muted-foreground italic'
                  colSpan={ columns.length + (selectionActions ? 2 : 0) }
                >
                  { noEntriesMessage || 'No hay entradas' }
                </td>
              </TableRow>
          }
        </TableBody>
      </ShdcnTable>
      { server
        ? server.pagination &&
          <TablePaginator
            page={ server.pagination.page }
            pages={ server.pagination.pages }
            count={ server.pagination.count }
            perPage={ server.pagination.perPage }
            onPageChange={ server.setPage }
            onItemsPerPageChange={ server.setPerPage }
          />
        : clientPagination &&
          <TablePaginator
            page={ clientPagination.page + 1 }
            pages={ Math.ceil(collection.length / clientPagination.itemsPerPage) }
            count={ collection.length }
            perPage={ clientPagination.itemsPerPage }
            onPageChange={ page => setPage(page - 1) }
            onItemsPerPageChange={ setItemsPerPage }
          />
      }
    </div>
  )
}

const SEARCH_DEBOUNCE_MS = 300

/* Below this a table fits on one screen, and a search box is more clutter than help */
const SEARCH_THRESHOLD = 15

/* the column header names the sort for the user, `sortKey` names it for the api */
const sortKeyOf = <T extends Entity>(columns: TableColumn<T>[], columnName: string): string | undefined =>
  columns.find(column => normalized(column.name) === columnName)?.sortKey

const cellValue = <T extends Entity> (column: TableColumn<T>, item: RowData<T>): ReactNode => {
  if (column.component)
    return column.component()

  const data = item.data[normalized(column.name)]

  return column.presenter
    ? column.presenter(data.value, item.entity)
    : String(data.value ?? '-')
}

export default Table