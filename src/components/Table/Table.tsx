import { type ReactNode, useMemo, useReducer, useRef, useState } from 'react'
import { mapToData, filterData } from './processors/dataProcessor'
import TablePaginator, { DEFAULT_PER_PAGE } from '@/components/Table/TablePaginator/TablePaginator'
import TableToolbar from '@/components/Table/TableToolbar/TableToolbar'
import useDebouncedCallback from '@/components/Table/hooks/useDebouncedCallback'
import { nextSort, sortData } from './processors/dataSort'
import { paginateData } from './processors/dataPaginate'
import SortingHeader from '@/components/Table/SortingHeader/SortingHeader'
import type { Entity } from '@/types.ts'
import {
  isCustomCol,
  type RowData,
  type TableColumn,
  type TableData,
  type TableProps,
  type TableQuery
} from '@/components/Table/types.ts'
import { type FilterAction, isFilterActive } from '@/components/Table/TableFilter/types.ts'
import filterReducer from '@/components/Table/TableFilter/filterReducer.ts'
import { Table as ShdcnTable, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { cellPadding } from '@/components/Table/util.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { TableActions } from '@/components/Table/TableActions/TableActions.tsx'
import { SquareArrowOutUpRight, X } from 'lucide-react'
import selectionReducer, { type SelectionTypes } from '@/components/Table/reducers/selectionReducer'
import TableSkeleton from '@/components/Table/TableSkeleton.tsx'
import Blinker from '@/components/Blinker/Blinker.tsx'
import ClickableCell from '@/components/Table/ClickableCell/ClickableCell.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import useTableQuery from '@/components/Table/hooks/useTableQuery.ts'

type TableViewProps<T extends Entity> = Omit<TableProps<T>, 'tableQuery'> & { query: TableQuery }

/* A table given no query narrows its collection with its own, a local one */
const Table = <T extends Entity>({ tableQuery, ...props }: TableProps<T>) =>
  tableQuery
    ? <TableView { ...props } query={ tableQuery } />
    : <LocalTable { ...props } />

const LocalTable = <T extends Entity>(props: Omit<TableProps<T>, 'tableQuery'>) => {
  const query = useTableQuery()
  return <TableView { ...props } query={ query } />
}

const TableView = <T extends Entity>(
{
  collection=[],
  pagination,
  query,
  columns,
  loadingMessage,
  noEntriesMessage,
  selectable=false,
  onSelectionChange,
  selectedId,
  actions,
  selectionActions,
  blink,
  isLoading,
  ...props
}: TableViewProps<T>) => {

  const isServer = query.mode === 'server'

  const [searchInput, setSearchInput] = useState(query.search)
  const [selection, dispatchSelection] = useReducer(selectionReducer<T>, [] as T['id'][])
  const toolbarShown = useRef(false)

  // a server table asks the api once the user stops typing, a local one filters as they type
  useDebouncedCallback(searchInput, SEARCH_DEBOUNCE_MS, term => {
    if (isServer)
      query.setSearch(term)
  })

  const changeSearch = (term: string) => {
    setSearchInput(term)

    if (!isServer)
      query.setSearch(term)
  }

  const tableData = useMemo<TableData<T>>(
    () => mapToData(collection, columns, blink),
    [collection, columns]
  )

  // in server mode the api already searched, filtered and sorted
  const narrowedData = useMemo<TableData<T>>(
    () => isServer
      ? tableData
      : sortData(filterData(tableData, { search: query.search, filter: query.filter }), query.sort),
    [tableData, query.search, query.filter, query.sort, isServer]
  )

  if (isLoading)
    return (
      <>
        <div className='w-full flex items-center gap-2 p-4 text-sm text-gray-700'>
          { loadingMessage || 'cargando' } <Spinner />
        </div>
        <TableSkeleton colCount={ columns.length }/>
      </>
    )

  // the api knows how many rows there are in total, a local table has them all in hand
  const count = isServer ? pagination?.count ?? collection.length : narrowedData.length
  const pages = isServer ? pagination?.pages ?? 1 : Math.max(1, Math.ceil(count / query.perPage))

  // a local collection can shrink under the page it was on: a search, a filter, a delete
  const page = isServer ? pagination?.page ?? query.page : Math.min(query.page, pages)

  // sort before slicing: sorting a slice only orders the rows already on the page
  const rows = isServer
    ? narrowedData
    : paginateData(narrowedData, { page, perPage: query.perPage })

  const hasFilter = Object.keys(query.filter).length > 0

  // the controls stay while something narrows the collection, so it can be widened back. A filter
  // panel narrows by itself: hiding it as its last box is unchecked would pull it from under the user
  const isNarrowed = !!searchInput || !!query.search || isFilterActive(query.filter)

  // once up, the toolbar stays: widening a search shows the narrowed count until the api answers,
  // and hiding the box in between would take the focus away from whoever is typing in it
  toolbarShown.current ||= hasFilter || isNarrowed || count > SEARCH_THRESHOLD
  const showToolbar = toolbarShown.current

  // against the smallest page, so picking a bigger one does not take the page size picker away
  const showPaginator =
    (!isServer || !!pagination) && (count > Math.min(query.perPage, DEFAULT_PER_PAGE) || page > 1)

  const changeFilter = (action: FilterAction) => query.setFilter(filterReducer(query.filter, action))

  const applySelection = (type: SelectionTypes, isSelected: boolean, item?: RowData<T>) => {
    const action = type === 'SELECT_ALL'
      ? { type, payload: { ids: collection.map(item => item.id), isSelected} }
      : { type, payload: { id: item?.id || 0, isSelected} }

    dispatchSelection(action)
    onSelectionChange?.(selectionReducer(selection, action))
  }

  const setSortColumn = (columnKey: string) => query.setSort(nextSort(query.sort, columnKey))

  const hasActions = !!actions || !!selectionActions

  return (
    <div className={`rounded-lg border overflow-hidden bg-background ${props.className}`}>
      { showToolbar &&
        <TableToolbar
          search={ searchInput }
          searchPlaceholder='Buscar'
          onSearchChange={ changeSearch }
          filter={ hasFilter ? query.filter : undefined }
          filterLabels={ columnLabels(columns) }
          dispatchFilterChange={ changeFilter }
        />
      }
      <ShdcnTable className='text-[13px]'>
        <SortingHeader
          columns={ columns }
          sort={ query.sort }
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
                        key={`${id}-${column.key}`}
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
      { showPaginator &&
        <TablePaginator
          page={ page }
          pages={ pages }
          count={ count }
          perPage={ query.perPage }
          onPageChange={ query.setPage }
          onItemsPerPageChange={ query.setPerPage }
        />
      }
    </div>
  )
}

const SEARCH_DEBOUNCE_MS = 300

/* Below this a table fits on one screen, and a search box is more clutter than help */
const SEARCH_THRESHOLD = 15

/* what the filter panel calls each column: its header */
const columnLabels = <T extends Entity>(columns: TableColumn<T>[]): Record<string, string> =>
  Object.fromEntries(
    columns.flatMap(column => isCustomCol(column) ? [] : [[ column.key, column.name ]])
  )

const cellValue = <T extends Entity> (column: TableColumn<T>, item: RowData<T>): ReactNode => {
  if (column.component)
    return column.component()

  const data = item.data[column.key]

  return column.presenter
    ? column.presenter(data.value, item.entity)
    : String(data.value ?? '-')
}

export default Table