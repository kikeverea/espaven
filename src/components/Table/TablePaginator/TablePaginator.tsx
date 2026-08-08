import {Entity} from '../types.ts'
import {Dispatch} from 'react'
import {Pagination} from './types.ts'

type TablePaginatorProps<T> = {
  pagination: Pagination,
  collection: T[],
  setPage: Dispatch<number>,
  setItemsPerPage: Dispatch<number>
}

const TablePaginator = <T extends Entity>({ pagination, setPage, setItemsPerPage, collection }: TablePaginatorProps<T>) => {

  const { page=0, itemsPerPage } = pagination

  const handleLeftArrowClick = () => {
    if (page > 0)
      setPage(page - 1)
  }

  const handleRightArrowClick = () => {
    if (page < collection.length - 1)
      setPage(page + 1)
  }

  const paginationInfoMessage = (): string => {
    if (!collection)
      return ''

    const paginationStart = page * itemsPerPage
    const paginationEnd = Math.min(collection.length, paginationStart + itemsPerPage)

    return `Showing ${paginationStart + 1} to ${paginationEnd} of ${collection.length} records`
  }

  const pages = pagination
    ? Math.ceil((collection?.length || 0) / itemsPerPage)
    : 1

  return (
    <div>
      <span role="status" aria-live="polite">
        { paginationInfoMessage() }
      </span>
      <nav aria-label="Pagination Navigation">
        <ul>
          <select
            id="per-page-select"
            name="per-page-select"
            onChange={ (e) => setItemsPerPage(parseInt(e.currentTarget.value)) }
          >
            { itemsPerPage < 10 && <option value={ itemsPerPage }>{ pagination.itemsPerPage }</option> }
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          { pages > 6 &&
            <li onClick={ handleLeftArrowClick } aria-label='Go to previous page'>←</li>
          }
          { Array.from({ length: Math.min(pages, 6) }).map((_u, index: number) =>
            <li
              key={ index }
              style={{ padding: '10px', backgroundColor: "#1A84FF", color: 'white', display: 'flex', gap: '16px' }}
              aria-label={ `Go to page ${index + 1}` }
              aria-current={ page === index }
              onClick={() => setPage(index)}
            >
              { index + 1 }
            </li>
          )}
          { pages > 6 &&
            <li onClick={ handleRightArrowClick } aria-label='Go to next page'>→</li>
          }
        </ul>
      </nav>
    </div>
  )

}

export default TablePaginator