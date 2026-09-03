import { type ReactNode, useMemo, useReducer } from 'react'
import { mapToData, filterData } from './processors/dataProcessor'
import useSort from './hooks/useSort'
import usePagination from './hooks/usePagination'
import TablePaginator from '@/components/Table/TablePaginator/TablePaginator'
import { sortAndPaginateData } from './processors/dataSortAndPaginate'
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

const Table = <T extends Entity>(
{
  collection=[],
  columns,
  search,
  filter,
  sortBy,
  paginate,
  page: currentPage,
  noEntriesMessage,
  selectable=false,
  onSelectionChange,
  selectedId,
  actions,
  selectionActions,
  blink,
  ...props
}: TableProps<T>) => {

  if (!collection)
    return <TableSkeleton colCount={ columns.length }/>

  const tableData = useMemo<TableData<T>>(
    () => mapToData(collection, columns, blink),
    [collection, columns]
  )

  const filteredData = useMemo<TableData<T>>(
    () => filterData(tableData, { search, filter }),
    [tableData, search, filter]
  )

  const [sort, setSortColumn] = useSort(sortBy)
  const [pagination, setItemsPerPage, setPage] = usePagination(paginate, currentPage || 0)
  const [selection, dispatchSelection] = useReducer(selectionReducer<T>, [] as T['id'][])

  const applySelection = (type: SelectionTypes, isSelected: boolean, item?: RowData<T>) => {
    const action = type === 'SELECT_ALL'
      ? { type, payload: { ids: collection.map(item => item.id), isSelected} }
      : { type, payload: { id: item?.id || 0, isSelected} }

    dispatchSelection(action)
    onSelectionChange?.(selectionReducer(selection, action))
  }

  const rows = sortAndPaginateData(filteredData, { pagination, sort })
  const hasActions = !!actions || !!selectionActions

  return (
    <div className={`rounded-lg border overflow-hidden bg-background ${props.className}`}>
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
                  { columns.map((column, ind) =>
                    <TableCell
                      key={`${id}-${column.name || column.key}`}
                      className={`
                      ${cellPadding()}
                      ${!selectable && ind === 0 && row.blink ? 'relative' : ''}
                      ${id === selectedId ? 'bg-slate-100' : ''} text-gray-800
                      ${!isCustomCol(column) && column.onClick && 'cursor-pointer group'}
                     
                      ${ind === columns.length - 1 && !hasActions ? 'pe-8' : ''}
                    `}
                      onClick={ () => isCustomCol(column) ? null : column.onClick!(id) }
                    >
                      { !selectable && ind === 0 && row.blink &&
                        <Blinker className='absolute left-3 top-5.5' />
                      }
                      { !isCustomCol(column) && column.onClick
                        ? <div className='flex items-center gap-2 w-full text-blue-500'>
                            { cellValue(column, row) }
                            { selectedId === id
                              ? <X className='invisible size-3.5 group-hover:visible'/>
                              : <SquareArrowOutUpRight className='invisible size-3.5 group-hover:visible'/>
                            }
                          </div>
                        : <div className={`${column.className || ''}`}>
                            { cellValue(column, row) }
                          </div>
                      }
                    </TableCell>
                  )}
                  { actions &&
                    <TableCell className={`text-end pe-5 max-w-8 w-8 xl:max-w-6.25 xl:w-w-6.25 ${id === selectedId ? 'bg-slate-100' : ''}`}>
                      <TableActions actions={ actions } row={ row } />
                    </TableCell>
                  }
                </TableRow>
              )
            })
            : <TableRow key='empty-message'>
                <td className='text-center py-4 text-muted-foreground italic' colSpan={ columns.length + 1 }>
                  { noEntriesMessage || 'No hay entradas' }
                </td>
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
    </div>
  )
}

const cellValue = <T extends Entity> (column: TableColumn<T>, item: RowData<T>): ReactNode => {
  if (column.component)
    return column.component()

  const data = item.data[normalized(column.name)]

  return column.presenter
    ? column.presenter(data.value, item.entity)
    : String(data.value ?? '-')
}

export default Table