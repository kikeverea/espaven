import type { MouseEvent } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

export const MAX_PAGE_LINKS = 6
const PER_PAGE_OPTIONS = [10, 25, 50, 100]

type TablePaginatorProps = {
  page: number
  pages: number
  count: number
  perPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
}

export const pageWindow = (page: number, pages: number, max: number = MAX_PAGE_LINKS): number[] => {
  if (pages <= max)
    return Array.from({ length: pages }, (_unused, ind) => ind + 1)

  const start = Math.min(
    Math.max(1, page - Math.floor((max - 1) / 2)),
    pages - max + 1
  )

  return Array.from({ length: max }, (_unused, ind) => start + ind)
}

const TablePaginator = (
  { page, pages, count, perPage, onPageChange, onItemsPerPageChange }: TablePaginatorProps
) => {

  const pageLinks = pageWindow(page, pages)
  const showArrows = pages > MAX_PAGE_LINKS

  const goTo = (target: number) => (event: MouseEvent) => {
    event.preventDefault()

    if (target >= 1 && target <= pages && target !== page)
      onPageChange(target)
  }

  const paginationInfoMessage = (): string => {
    if (!count)
      return 'Sin resultados'

    const start = (page - 1) * perPage
    const end = Math.min(count, start + perPage)

    return `Showing ${start + 1} to ${end} of ${count} records`
  }

  return (
    <div className='flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3'>
      <span role='status' aria-live='polite' className='text-[13px] text-muted-foreground'>
        { paginationInfoMessage() }
      </span>
      <Pagination aria-label='Pagination Navigation' className='mx-0 w-auto justify-end'>
        { onItemsPerPageChange &&
          <select
            id='per-page-select'
            name='per-page-select'
            aria-label='Items per page'
            value={ perPage }
            className='me-2 rounded-md border bg-background px-2 py-1 text-[13px]'
            onChange={ event => onItemsPerPageChange(parseInt(event.currentTarget.value)) }
          >
            { !PER_PAGE_OPTIONS.includes(perPage) && <option value={ perPage }>{ perPage }</option> }
            { PER_PAGE_OPTIONS.map(option =>
              <option key={ option } value={ option }>{ option }</option>
            )}
          </select>
        }
        <PaginationContent>
          { showArrows &&
            <PaginationItem>
              <PaginationPrevious
                href='#'
                text='Anterior'
                aria-label='Go to previous page'
                aria-disabled={ page <= 1 }
                className={ page <= 1 ? 'pointer-events-none opacity-50' : undefined }
                onClick={ goTo(page - 1) }
              />
            </PaginationItem>
          }
          { pageLinks[0] > 1 &&
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          }
          { pageLinks.map(pageNumber =>
            <PaginationItem key={ pageNumber }>
              <PaginationLink
                href='#'
                aria-label={ `Go to page ${pageNumber}` }
                isActive={ pageNumber === page }
                onClick={ goTo(pageNumber) }
              >
                { pageNumber }
              </PaginationLink>
            </PaginationItem>
          )}
          { pageLinks[pageLinks.length - 1] < pages &&
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          }
          { showArrows &&
            <PaginationItem>
              <PaginationNext
                href='#'
                text='Siguiente'
                aria-label='Go to next page'
                aria-disabled={ page >= pages }
                className={ page >= pages ? 'pointer-events-none opacity-50' : undefined }
                onClick={ goTo(page + 1) }
              />
            </PaginationItem>
          }
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default TablePaginator
