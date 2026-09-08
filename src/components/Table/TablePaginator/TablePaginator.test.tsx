import { render, screen, within } from '@testing-library/react'
import TablePaginator, { pageWindow } from './TablePaginator.tsx'
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom/vitest"

describe("Paginator", () => {

  const onPageChange = vi.fn()
  const onItemsPerPageChange = vi.fn()

  afterEach(() => {
    onPageChange.mockClear()
    onItemsPerPageChange.mockClear()
  })

  const renderPaginator = (
    { page = 1, pages, count, perPage }: { page?: number, pages: number, count: number, perPage: number }
  ) => {
    render(
      <TablePaginator
        page={ page }
        pages={ pages }
        count={ count }
        perPage={ perPage }
        onPageChange={ onPageChange }
        onItemsPerPageChange={ onItemsPerPageChange }
      />
    )
  }

  const navigation = () => screen.getByLabelText('Pagination Navigation')
  const pageLinks = () => within(navigation()).getAllByLabelText(/Go to page/)

  test('renders a link per page', () => {
    renderPaginator({ pages: 4, count: 7, perPage: 2 })

    expect(navigation()).toBeInTheDocument()
    expect(pageLinks()).toHaveLength(4)

    pageLinks().forEach((link, ind) => {
      expect(link.textContent).toBe(`${ind + 1}`)
    })
  })

  test('marks the current page with aria-current for accessibility', () => {
    renderPaginator({ page: 2, pages: 4, count: 7, perPage: 2 })

    expect(pageLinks()[1]).toHaveAttribute('aria-current', 'page')
    expect(pageLinks()[0]).not.toHaveAttribute('aria-current')
  })

  test('renders pagination info for the current page', () => {
    renderPaginator({ page: 1, pages: 4, count: 7, perPage: 2 })

    expect(screen.getByRole('status').textContent).toBe('Showing 1 to 2 of 7 records')
  })

  test('pagination info counts every record, not just the ones on screen', () => {
    renderPaginator({ page: 3, pages: 17, count: 405, perPage: 25 })

    expect(screen.getByRole('status').textContent).toBe('Showing 51 to 75 of 405 records')
  })

  test('the last page info stops at the record count', () => {
    renderPaginator({ page: 17, pages: 17, count: 405, perPage: 25 })

    expect(screen.getByRole('status').textContent).toBe('Showing 401 to 405 of 405 records')
  })

  test(`if more than ${6} pages, renders navigation arrows`, () => {
    renderPaginator({ page: 1, pages: 7, count: 7, perPage: 1 })

    expect(pageLinks()).toHaveLength(6)
    expect(within(navigation()).getByLabelText('Go to previous page')).toBeInTheDocument()
    expect(within(navigation()).getByLabelText('Go to next page')).toBeInTheDocument()
  })

  test('if the pages fit, renders no navigation arrows', () => {
    renderPaginator({ pages: 4, count: 7, perPage: 2 })

    expect(within(navigation()).queryByLabelText('Go to previous page')).not.toBeInTheDocument()
    expect(within(navigation()).queryByLabelText('Go to next page')).not.toBeInTheDocument()
  })

  test('clicking a page navigates to it', async () => {
    renderPaginator({ page: 1, pages: 4, count: 7, perPage: 2 })

    await userEvent.click(pageLinks()[2])
    expect(onPageChange).toHaveBeenLastCalledWith(3)
  })

  test('clicking the current page does nothing', async () => {
    renderPaginator({ page: 3, pages: 4, count: 7, perPage: 2 })

    await userEvent.click(pageLinks()[2])
    expect(onPageChange).not.toHaveBeenCalled()
  })

  test('left arrow navigates to the previous page', async () => {
    renderPaginator({ page: 5, pages: 7, count: 7, perPage: 1 })

    await userEvent.click(within(navigation()).getByLabelText('Go to previous page'))
    expect(onPageChange).toHaveBeenLastCalledWith(4)
  })

  test('on the first page, the left arrow does nothing', async () => {
    renderPaginator({ page: 1, pages: 7, count: 7, perPage: 1 })

    await userEvent.click(within(navigation()).getByLabelText('Go to previous page'))
    expect(onPageChange).not.toHaveBeenCalled()
  })

  test('right arrow navigates to the next page', async () => {
    renderPaginator({ page: 1, pages: 7, count: 7, perPage: 1 })

    await userEvent.click(within(navigation()).getByLabelText('Go to next page'))
    expect(onPageChange).toHaveBeenLastCalledWith(2)
  })

  test('on the last page, the right arrow does nothing', async () => {
    renderPaginator({ page: 7, pages: 7, count: 7, perPage: 1 })

    await userEvent.click(within(navigation()).getByLabelText('Go to next page'))
    expect(onPageChange).not.toHaveBeenCalled()
  })

  test('has a select for choosing items per page', async () => {
    renderPaginator({ pages: 17, count: 405, perPage: 25 })

    const select = within(navigation()).getByRole('combobox')
    await userEvent.selectOptions(select, '50')

    expect(onItemsPerPageChange).toHaveBeenLastCalledWith(50)
  })
})

describe('pageWindow', () => {

  test('lists every page when they all fit', () => {
    expect(pageWindow(1, 4)).toEqual([1, 2, 3, 4])
  })

  test('starts at the first page when the current page is near the start', () => {
    expect(pageWindow(1, 17)).toEqual([1, 2, 3, 4, 5, 6])
  })

  test('slides with the current page', () => {
    expect(pageWindow(9, 17)).toEqual([7, 8, 9, 10, 11, 12])
  })

  test('stops at the last page when the current page is near the end', () => {
    expect(pageWindow(17, 17)).toEqual([12, 13, 14, 15, 16, 17])
  })
})
