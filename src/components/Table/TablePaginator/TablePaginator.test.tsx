import {render, screen, within} from '@testing-library/react'
import TablePaginator from './TablePaginator.tsx'
import userEvent from '@testing-library/user-event'
import type { TestData } from '@/lib/testUtils.ts'
import type { Pagination } from '@/components/Table/TablePaginator/types.ts'
import "@testing-library/jest-dom/vitest"

const collection: TestData[] = [
  { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
  { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
  { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
  { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' },
  { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 6, birth: '2019-03-22' },
  { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 3, birth: '2022-11-16' },
  { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 5, birth: '2020-01-08' },
]

describe("Paginator", () => {

  const setPageMock = vi.fn()
  const setItemsPerPageMock = vi.fn()

  afterEach(() => {
    setPageMock.mockClear()
    setItemsPerPageMock.mockClear()
  })

  const renderPaginator = (args: Pagination) => {
    render(
      <TablePaginator
        collection={ collection }
        setPage={ setPageMock }
        setItemsPerPage={ setItemsPerPageMock }
        pagination={{ itemsPerPage: args.itemsPerPage, page: args.page }}
      />
    )
  }

  test('with pagination, render page numbers', () => {
    renderPaginator({ itemsPerPage: 2 })

    const paginationNavigation = screen.getByLabelText('Pagination Navigation')
    expect(paginationNavigation).toBeDefined()

    const pageLinks = within(paginationNavigation).getAllByRole('listitem')
    expect(pageLinks.length).toBe(4)

    pageLinks.forEach((link, ind) => {
      expect(link.textContent).toBe(`${ind + 1}`)
    })
  })

  test('page numbers include aria-current for accessibility', () => {
    renderPaginator({ itemsPerPage: 2 })

    const paginationNavigation = screen.getByLabelText('Pagination Navigation')
    const pageLinks = within(paginationNavigation).getAllByRole('listitem')

    expect(pageLinks[0].ariaCurrent).toBe('true')
    expect(pageLinks[1].ariaCurrent).toBe('false')
  })

  test('with pagination, render pagination info', () => {
    renderPaginator({ itemsPerPage: 2 })

    const paginationInfo = screen.getByRole('status')

    expect(paginationInfo.textContent).toBe(`Showing 1 to 2 of ${collection.length} records`)
  })

  test('if more than 6 pages, render navigation arrows', () => {
    renderPaginator({ itemsPerPage: 1 })

    const paginationNavigation = screen.getByLabelText('Pagination Navigation')

    const pageNumbers = within(paginationNavigation).getAllByRole('listitem')
    const leftArrow = within(paginationNavigation).getByLabelText('Go to previous page')
    const rightArrow = within(paginationNavigation).getByLabelText('Go to next page')

    expect(pageNumbers.length - 2).toBe(6)
    expect(leftArrow).toBeInTheDocument()
    expect(rightArrow).toBeInTheDocument()
  })

  test('left arrow navigates to previous page', async () => {
    const currentPage = 4
    renderPaginator({ itemsPerPage: 1, page: currentPage })

    const paginationNavigation = screen.getByLabelText('Pagination Navigation')
    const leftArrow = within(paginationNavigation).getByLabelText('Go to previous page')

    await userEvent.click(leftArrow)
    expect(setPageMock).toHaveBeenLastCalledWith((currentPage - 1))
  })

  test('if in first page, left arrow does nothing', async () => {
    const currentPage = 0
    renderPaginator({ itemsPerPage: 1, page: currentPage })

    const paginationNavigation = screen.getByLabelText('Pagination Navigation')
    const leftArrow = within(paginationNavigation).getByLabelText('Go to previous page')

    await userEvent.click(leftArrow)
    expect(setPageMock).toHaveBeenCalledTimes(0)
  })

  test('right arrow navigates to next page', async () => {
    const currentPage = 0
    renderPaginator({ itemsPerPage: 1, page: currentPage })

    const paginationNavigation = screen.getByLabelText('Pagination Navigation')
    const rightArrow = within(paginationNavigation).getByLabelText('Go to next page')

    await userEvent.click(rightArrow)
    expect(setPageMock).toHaveBeenLastCalledWith((currentPage + 1))
  })

  test('if in last page, right arrow does nothing', async () => {
    const currentPage = collection.length - 1
    renderPaginator({ itemsPerPage: 1, page: currentPage })

    const paginationNavigation = screen.getByLabelText('Pagination Navigation')
    const rightArrow = within(paginationNavigation).getByLabelText('Go to next page')

    await userEvent.click(rightArrow)
    expect(setPageMock).toHaveBeenCalledTimes(0)
  })

  test('has a select for choosing items per page', () => {
    renderPaginator({ itemsPerPage: 2 })

    const paginationNavigation = screen.getByLabelText('Pagination Navigation')
    const pageCountSelect = within(paginationNavigation).getByRole('combobox')

    expect(pageCountSelect).toBeDefined()
  })
})