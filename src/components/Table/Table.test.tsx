import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Table from './Table.tsx'
import type { ServerTable, TableColumn } from '@/components/Table/types'
import type { FilterColumns } from '@/components/Table/TableToolbar/types'

import type { TestData, UpdateFilterArgs } from '@/lib/testUtils.ts'
import {
  formatDate,
  dataRows,
  getNameCellsContent,
  parseDate,
  getTestData, newFilter
} from '@/lib/testUtils.ts'
import { expect } from 'vitest'
import { useState } from 'react'

describe('Table', () => {

  const columns: TableColumn<TestData>[] = [
    { name: 'Name', accessor: 'name' },
    { name: 'Family', accessor: item => item.family },
    { name: 'Type', accessor: 'type' },
    { name: 'Age', accessor: item => item.age },
    { name: 'Birth', accessor: item => parseDate(item.birth), presenter: formatDate }
  ]

  const collection: TestData[] = [
    { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
    { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
    { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
    { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' }
  ]

  const longCollection: TestData[] = [
    { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
    { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
    { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
    { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' },
    { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 6, birth: '2019-03-22' },
    { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 3, birth: '2022-11-16' },
    { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 5, birth: '2020-01-08' },
  ]

  const pageLink = (page: number) =>
    within(screen.getByLabelText('Pagination Navigation')).getByLabelText(`Go to page ${page}`)

  const filterColumns: FilterColumns = [ 'Family', 'Type', ['Age', 'range'], ['Birth', 'range', parseDate] ]
  const filterAnd = (args?: UpdateFilterArgs) => newFilter(filterColumns, args, longCollection)

  describe('While loading', () => {

    /* Keeps the table mounted across the flip, the way a refetch does */
    const LoadingHarness = () => {
      const [isLoading, setIsLoading] = useState(false)

      return (
        <>
          <button type='button' onClick={() => setIsLoading(!isLoading)}>toggle</button>
          <Table collection={collection} columns={columns} selectable={true} isLoading={isLoading} />
        </>
      )
    }

    const rowCheckboxes = () => {
      const [ , body ] = screen.getAllByRole('rowgroup')
      return within(body).getAllByRole('checkbox')
    }

    test('renders the skeleton instead of the rows', () => {
      render(<Table collection={ collection } columns={ columns } isLoading={ true }/>)

      expect(screen.queryByText(collection[0].name)).not.toBeInTheDocument()
    })

    test('keeps the table state across a reload', async () => {
      const user = userEvent.setup()
      render(<LoadingHarness />)

      await user.click(rowCheckboxes()[1])
      expect(rowCheckboxes()[1]).toBeChecked()

      const toggle = screen.getByRole('button', { name: 'toggle' })

      /* Hooks declared under an early return would remount here, emptying the selection */
      await user.click(toggle)
      await user.click(toggle)

      expect(rowCheckboxes()[1]).toBeChecked()
    })
  })

  describe('Without data', () => {
    test('renders header', () => {
      render(<Table collection={ [] } columns={ columns } />)

      const headerCells = screen.getAllByRole('columnheader')

      expect(headerCells[0].textContent).toBe('Name')
      expect(headerCells[1].textContent).toBe('Family')
      expect(headerCells[2].textContent).toBe('Type')
      expect(headerCells[3].textContent).toBe('Age')
      expect(headerCells[4].textContent).toBe('Birth')
    })

    test('renders empty message', () => {
      render(<Table collection={ [] } columns={ columns } />)

      expect(getNameCellsContent()).toEqual(['No hay entradas'])
    })

    test('renders custom empty message', () => {
      render(<Table collection={ [] } columns={ columns } noEntriesMessage='No entries'/>)

      expect(getNameCellsContent()).toEqual(['No entries'])
    })
  })

  describe('With data', () => {

    test('renders collection', () => {
      render(<Table collection={ collection } columns={ columns }/>)

      const rows = screen.getAllByRole('row')

      rows.slice(1).forEach((row, rowIndex) => {
        const cells = within(row).getAllByRole('cell')

        cells.forEach((cell, colIndex) => {
          expect(cell.textContent).toBe(getTestData({ collection, row: rowIndex, col: colIndex }))
        })
      })
    })

    test('renders checkboxes if selectable', () => {
      render(<Table collection={ collection } columns={ columns } selectable={ true }/>)

      const [header, body] = screen.getAllByRole('rowgroup')

      const headerCheckbox = within(header).getByRole('checkbox')
      const rowCheckboxes = within(body).getAllByRole('checkbox')

      expect(headerCheckbox).toBeInTheDocument()
      expect(rowCheckboxes).toHaveLength(collection.length)
    })

    test('calls selection change', async () => {
      const mock = vi.fn()
      render(<Table collection={ collection } columns={ columns } selectable={ true } onSelectionChange={ mock }/>)

      const [header, body] = screen.getAllByRole('rowgroup')

      const headerCheckbox = within(header).getByRole('checkbox')
      const rowCheckboxes = within(body).getAllByRole('checkbox')
      const rowCheckbox = rowCheckboxes[Math.floor(Math.random() * rowCheckboxes.length)]

      await userEvent.click(headerCheckbox)
      await userEvent.click(rowCheckbox)

      expect(mock).toHaveBeenCalledTimes(2)
    })

    test('renders action buttons', () => {
      render(<Table collection={ collection } columns={ columns } selectable={ true } actions={[
        { label: 'Delete', action: () => {} },
        { label: 'Delete', action: () => {}, destructive: true },
      ]}/>)

      const buttons = screen.getAllByRole('button')

      expect(buttons).toHaveLength(collection.length)
    })

    test('renders selection actions', async () => {
      render(<Table collection={ collection } columns={ columns } selectable={ true } selectionActions={[
        { icon: <i></i>, mutation: () => '', onSuccess: () => {} },
      ]}/>)

      /* Mounted from the start, hidden until something is selected, so the header does not jump */
      const [ hiddenAction ] = screen.getAllByRole('button')
      expect(hiddenAction).toHaveClass('invisible')

      const [_header, body] = screen.getAllByRole('rowgroup')
      const rowCheckboxes = within(body).getAllByRole('checkbox')
      const rowCheckbox = rowCheckboxes[Math.floor(Math.random() * rowCheckboxes.length)]

      await userEvent.click(rowCheckbox)

      expect(screen.getByRole('button')).not.toHaveClass('invisible')
    })

    test('renders custom columns', () => {
      const testColumns = [
        ...columns,
        { header: () => <span data-testid='test-header'></span>,
          component: () => <span data-testid='test-cell'></span>,
          key: 'custom'
        }
      ]

      render(<Table collection={ collection } columns={ testColumns }/>)

      const header = screen.getByTestId('test-header')
      const components = screen.getAllByTestId('test-cell')

      expect(header).toBeInTheDocument()
      expect(components).toHaveLength(collection.length)
    })

    test('calls on column click', async () => {
      const mock = vi.fn()
      const testColumns = [
        { name: 'Clickable', accessor: () => 'Clickable', onClick: mock },
        ...columns,
      ]

      render(<Table collection={ collection } columns={ testColumns }/>)

      const rowInd = 0
      const row = screen.getAllByRole('row').splice(1)[rowInd]
      const clickableCell = within(row).getAllByRole('cell')[0]

      const content = within(clickableCell).getByText('Clickable')
      await userEvent.click(content)

      expect(mock).toHaveBeenCalledTimes(1)
      expect(mock).toHaveBeenCalledWith(collection[rowInd].id)
    })

    test('renders blinkers', () => {
      render(<Table collection={ collection } columns={ columns } blink={ () => true }/>)
      expect(screen.getAllByTestId('blinker')).toHaveLength(collection.length)
    })

    describe('Search', () => {
      test('renders rows that pass the search', () => {
        render(<Table collection={ collection } columns={ columns } search='dog' />)

        expect(getNameCellsContent()).toEqual(['Dog'])
      })

      test('renders empty message if no row passes the search', () => {
        render(<Table collection={ collection } columns={ columns } search='no-rows' />)

        expect(getNameCellsContent()).toEqual(['No hay entradas'])
      })
    })

    describe('Filter', () => {

      test('renders rows that pass the filter', () => {
        render(<Table collection={ longCollection } columns={ columns } filter={
          filterAnd({
            'family': ['feline', 'canine' ],
            'type': ['wild', 'canine' ],
          })}
        />)

        expect(getNameCellsContent()).toEqual(['Lion', 'Red Fox'])
      })

      test('renders rows that pass the filter and search', () => {
        render(<Table collection={ collection } columns={ columns } search='cat' filter={
          filterAnd({
            'family': ['feline' ],
          })}
        />)

        expect(getNameCellsContent()).toEqual(['Cat'])
      })

      test('renders rows that pass the range filter', () => {
        render(<Table collection={ collection } columns={ columns } filter={
          filterAnd({
            'age': { min: 8, max: 15 },
          })}
        />)

        expect(getNameCellsContent()).toEqual(['Cat', 'Lion'])
      })

      test('renders rows that pass the range filter, edge cases', () => {
        render(<Table collection={ collection } columns={ columns }filter={
          filterAnd({
            'age': { min: 10, max: 13 },
          })}
        />)

        expect(getNameCellsContent()).toEqual(['Cat', 'Lion'])
      })

      test('renders rows that pass a min range filter', () => {
        render(<Table collection={ collection } columns={ columns } filter={
          filterAnd({
            'age': { min: 12 },
          })}
        />)

        expect(getNameCellsContent()).toEqual(['Lion', 'Sea Lion'])
      })

      test.each([
        { 'age': { min: 18 } } as UpdateFilterArgs,
        { 'age': { max: 2 } },
        { 'age': { min: 18, max: 20 } },
        { 'family': ['primate'], 'type': ['pet'] }
      ])
      ('renders empty message if no row passes the filter', (noPassFilter) => {

        render(<Table collection={ collection } columns={ columns } filter={ filterAnd(noPassFilter) } />)

        expect(getNameCellsContent()).toEqual(['No hay entradas'])
      })

      test('renders empty message if no row passes the filter and search', () => {
        render(<Table collection={ collection } columns={ columns } search='dog' filter={
          filterAnd({
            'family': ['feline' ],
          })}
        />)

        expect(getNameCellsContent()).toEqual(['No hay entradas'])
      })

      test('renders rows that pass the max range filter', () => {
        render(<Table collection={ collection } columns={ columns } filter={
          filterAnd({
            'age': { max: 12 },
          })}
        />)

        expect(getNameCellsContent()).toEqual(['Cat', 'Dog'])
      })

      test('renders rows that pass the date range filter', () => {
        render(
          <Table
            collection={ collection }
            columns={ columns }
            filter={
              filterAnd({
                'birth': {
                  min: '2012-07-14',
                  max: '2015-07-14',
                  parser: parseDate
                },
              })}
          />)

        expect(getNameCellsContent()).toEqual(['Cat', 'Lion'])
      })

      test('renders rows that pass a range filter, filter and search', () => {
        render(<Table
          collection={ collection }
          columns={ columns }
          search='Lion'
          filter={
            filterAnd({
              'age': { min: 8, max: 16 }, 'family': ['feline']
            })}
        />)

        expect(getNameCellsContent()).toEqual(['Lion'])
      })
    })

    describe('Search', () => {

      const manyRows = (count: number): TestData[] =>
        Array.from({ length: count }, (_unused, ind) => ({
          id: ind + 1, name: `Animal ${ind + 1}`, family: 'Feline', type: 'Pet', age: ind, birth: '2015-07-14'
        }))

      const searchBox = () => screen.queryByLabelText('table search')

      test('is hidden on a small client mode collection', () => {
        render(<Table collection={ manyRows(15) } columns={ columns } />)

        expect(searchBox()).not.toBeInTheDocument()
      })

      test('appears once a client mode collection passes the threshold', () => {
        render(<Table collection={ manyRows(16) } columns={ columns } />)

        expect(searchBox()).toBeInTheDocument()
      })

      test('always appears in server mode, however few rows came back', () => {
        render(
          <Table
            collection={ collection }
            columns={ columns }
            server={{
              pagination: { page: 1, pages: 1, count: 4, perPage: 25, next: null, prev: null },
              search: '', setPage: vi.fn(), setPerPage: vi.fn(), setSearch: vi.fn(), setSort: vi.fn()
            }}
          />
        )

        expect(searchBox()).toBeInTheDocument()
      })

      test('counts the whole collection in server mode, not the rows on screen', () => {
        // four rows on this page, but the api says there are 400: the box belongs there
        render(
          <Table
            collection={ collection }
            columns={ columns }
            server={{
              pagination: { page: 1, pages: 100, count: 400, perPage: 4, next: 2, prev: null },
              search: '', setPage: vi.fn(), setPerPage: vi.fn(), setSearch: vi.fn(), setSort: vi.fn()
            }}
          />
        )

        expect(searchBox()).toBeInTheDocument()
      })

      test('filters locally in client mode', async () => {
        render(<Table collection={ manyRows(16) } columns={ columns } />)

        await userEvent.type(searchBox()!, 'Animal 16')

        expect(getNameCellsContent()).toEqual(['Animal 16'])
      })

      test('hands the api the term that was typed', async () => {
        const setSearch = vi.fn()

        render(
          <Table
            collection={ collection }
            columns={ columns }
            server={{
              pagination: { page: 1, pages: 17, count: 405, perPage: 25, next: 2, prev: null },
              search: '', setPage: vi.fn(), setPerPage: vi.fn(), setSearch, setSort: vi.fn()
            }}
          />
        )

        await userEvent.type(searchBox()!, 'turbo')

        // debounced: one call for the settled term, not one per keystroke
        await waitFor(() => expect(setSearch).toHaveBeenCalledWith('turbo'))
        expect(setSearch).toHaveBeenCalledTimes(1)
      })

      test('does not re-filter server results locally', async () => {
        // the api sent these four rows as the answer for 'zzz'; the table must not second guess it
        render(
          <Table
            collection={ collection }
            columns={ columns }
            server={{
              pagination: { page: 1, pages: 1, count: 4, perPage: 25, next: null, prev: null },
              search: 'zzz', setPage: vi.fn(), setPerPage: vi.fn(), setSearch: vi.fn(), setSort: vi.fn()
            }}
          />
        )

        expect(dataRows()).toHaveLength(collection.length)
      })
    })

    describe('Client mode', () => {

      test('paginates data', () => {
        render(<Table collection={ collection } columns={ columns } paginate={ 2 }/>)

        expect(getNameCellsContent()).toEqual(['Cat', 'Dog'])
      })

      test('renders the selected page data', async () => {
        render(<Table collection={ collection } columns={ columns } paginate={ 2 }/>)

        await userEvent.click(pageLink(2))

        expect(getNameCellsContent()).toEqual(['Lion', 'Sea Lion'])
      })

      test('left arrow navigates to previous page', async () => {
        render(<Table collection={ longCollection } columns={ columns } paginate={ 1 } page={ 4 } />)

        await userEvent.click(screen.getByLabelText('Go to previous page'))

        expect(getNameCellsContent()).toEqual([longCollection[3].name])
      })

      test('right arrow navigates to next page', async () => {
        render(<Table collection={ longCollection } columns={ columns } paginate={ 1 } page={ 4 } />)

        await userEvent.click(screen.getByLabelText('Go to next page'))

        expect(getNameCellsContent()).toEqual([longCollection[5].name])
      })

      test('selecting items per page renders that amount of items', async () => {
        render(<Table collection={ longCollection } columns={ columns } paginate={ 2 } />)

        await userEvent.selectOptions(screen.getByRole('combobox'), '10')

        expect(dataRows()).toHaveLength(Math.min(longCollection.length, 10))
      })

      test('sorts the whole collection before paging it, not just the page', async () => {
        render(
          <Table collection={ longCollection } columns={ columns } sortBy={{ column: 'family' }} paginate={ 2 } />
        )

        // 'Dog' and 'Red Fox' are both Canine: the first two of the sorted collection,
        // not the first two rows of page one sorted among themselves
        expect(getNameCellsContent()).toEqual(['Dog', 'Red Fox'])
      })

      test('counts the whole collection in the pagination info', () => {
        render(<Table collection={ longCollection } columns={ columns } paginate={ 2 } />)

        expect(screen.getByRole('status').textContent)
          .toBe(`Showing 1 to 2 of ${longCollection.length} records`)
      })
    })

    describe('Server mode', () => {

      // the api already sliced this page out of a much bigger collection
      const pagination = { page: 2, pages: 17, count: 405, perPage: 25, next: 3, prev: 1 }

      const serverTable = (overrides: Partial<ServerTable> = {}): ServerTable => ({
        pagination,
        search: '',
        setPage: vi.fn(),
        setPerPage: vi.fn(),
        setSearch: vi.fn(),
        setSort: vi.fn(),
        ...overrides
      })

      const sortableColumns: TableColumn<TestData>[] = [
        { name: 'Name', accessor: 'name', sortKey: 'animals.name' },
        { name: 'Family', accessor: item => item.family }
      ]

      test('renders every row it was given, without slicing them again', () => {
        render(<Table collection={ longCollection } columns={ columns } server={ serverTable() } />)

        expect(dataRows()).toHaveLength(longCollection.length)
      })

      test('reports the position of the page inside the whole collection', () => {
        render(<Table collection={ longCollection } columns={ columns } server={ serverTable() } />)

        expect(screen.getByRole('status').textContent).toBe('Showing 26 to 50 of 405 records')
      })

      test('asks the api for a new page instead of paging locally', async () => {
        const setPage = vi.fn()
        render(<Table collection={ longCollection } columns={ columns } server={ serverTable({ setPage }) } />)

        await userEvent.click(pageLink(4))

        expect(setPage).toHaveBeenCalledWith(4)
        expect(dataRows()).toHaveLength(longCollection.length)     // still the page the api gave us
      })

      test('asks the api for a new page size', async () => {
        const setPerPage = vi.fn()
        render(<Table collection={ longCollection } columns={ columns } server={ serverTable({ setPerPage }) } />)

        await userEvent.selectOptions(screen.getByRole('combobox'), '100')

        expect(setPerPage).toHaveBeenCalledWith(100)
      })

      test('reports the clicked column with the key the api knows it by', async () => {
        const setSort = vi.fn()
        render(
          <Table collection={ longCollection } columns={ sortableColumns } server={ serverTable({ setSort }) } />
        )

        await userEvent.click(screen.getAllByRole('columnheader')[0])

        expect(setSort).toHaveBeenCalledWith({ column: 'name', key: 'animals.name' })
      })

      test('falls back to the column name when it declares no api key', async () => {
        const setSort = vi.fn()
        render(
          <Table collection={ longCollection } columns={ sortableColumns } server={ serverTable({ setSort }) } />
        )

        await userEvent.click(screen.getAllByRole('columnheader')[1])

        expect(setSort).toHaveBeenCalledWith({ column: 'family', key: undefined })
      })

      test('flips the direction when the sorted column is clicked again', async () => {
        const setSort = vi.fn()
        render(
          <Table
            collection={ longCollection }
            columns={ sortableColumns }
            server={ serverTable({ setSort, sort: { column: 'name', direction: 'asc' } }) }
          />
        )

        await userEvent.click(screen.getAllByRole('columnheader')[0])

        expect(setSort).toHaveBeenCalledWith({ column: 'name', direction: 'desc', key: 'animals.name' })
      })

      test('leaves the rows in the order the api sent them', () => {
        render(
          <Table
            collection={ longCollection }
            columns={ sortableColumns }
            server={ serverTable({ sort: { column: 'name', direction: 'asc' } }) }
          />
        )

        // the api sorts, so the rows stay put until it answers with a new page
        expect(getNameCellsContent()).toEqual(longCollection.map(item => item.name))
      })

      test('renders no paginator until the api sends pagination', () => {
        render(
          <Table collection={ longCollection } columns={ columns } server={ serverTable({ pagination: undefined }) } />
        )

        expect(screen.queryByLabelText('Pagination Navigation')).not.toBeInTheDocument()
      })
    })

    describe('Sorting', () => {
      test('sorts rows ascending', () => {
        render(<Table collection={ collection } columns={ columns } sortBy={{ column: 'family' }} />)

        expect(getNameCellsContent()).toEqual(['Dog', 'Cat', 'Lion', 'Sea Lion'])
      })

      test('sorts rows descending', () => {
        render(<Table collection={ collection } columns={ columns } sortBy={{ column: 'family', direction: 'desc' }} />)

        expect(getNameCellsContent()).toEqual(['Sea Lion', 'Cat', 'Lion', 'Dog'])
      })

      test('sorts by number asc', () => {
        render(<Table collection={ collection } columns={ columns } sortBy={{ column: 'age' }} />)

        expect(getNameCellsContent()).toEqual(['Dog', 'Cat', 'Lion', 'Sea Lion'])
      })

      test('sorts by number desc', () => {
        render(<Table collection={ collection } columns={ columns } sortBy={{ column: 'age', direction: 'desc' }} />)

        expect(getNameCellsContent()).toEqual(['Sea Lion', 'Lion', 'Cat', 'Dog'])
      })

      test('sorts by date asc', () => {
        render(<Table collection={ collection } columns={ columns } sortBy={{ column: 'birth' }} />)

        expect(getNameCellsContent()).toEqual(['Sea Lion', 'Lion', 'Cat', 'Dog'])
      })

      test('sorts by date desc', () => {
        render(<Table collection={ collection } columns={ columns } sortBy={{ column: 'birth', direction: 'desc' }} />)

        expect(getNameCellsContent()).toEqual(['Dog', 'Cat', 'Lion', 'Sea Lion'])
      })

      test.each(['asc', 'desc'])
      ('sorts invalid dates in last positions', sortDirection=> {
        render(<Table
          collection={ [...collection, { id: 5, name: 'Invalid', family: 'x', type: 'x', age: 0, birth: 'invalid' }] }
          columns={ columns }
          sortBy={{ column: 'birth', direction: sortDirection as ('asc' | 'desc') }}
        />)

        // Names in expected order
        const [_animal1, _animal2, _animal3, _animal4, invalid] = getNameCellsContent()
        expect(invalid).toBe('Invalid')
      })

      test('sorts rows that pass a range filter, filter and search', () => {
        render(<Table
          collection={ collection }
          columns={ columns }
          filter={ filterAnd({ 'age': { min: 8, max: 16 } })}
          search='Lion'
          sortBy={{ column: 'name', direction: 'desc' }}
        />)

        expect(getNameCellsContent()).toEqual(['Sea Lion', 'Lion'])
      })

      test('sorts by the initial sort column', () => {
        render(<Table collection={ collection } columns={ columns } sortBy={{ column: 'family' }} />)

        expect(getNameCellsContent()).toEqual(['Dog', 'Cat', 'Lion', 'Sea Lion'])
      })

      test('sorts the table by the clicked header', async () => {
        render(<Table collection={ collection } columns={ columns } sortBy={{ column: 'family' }} />)

        const nameHeader = screen.getAllByRole('columnheader')[0]
        await userEvent.click(nameHeader)

        expect(getNameCellsContent()).toEqual(['Cat', 'Dog', 'Lion', 'Sea Lion'])
      })

      test('toggles sort direction when clicking the sorting header', async () => {
        render(<Table collection={ collection } columns={ columns } sortBy={{ column: 'family', direction: 'asc'}} />)

        const familyHeader = screen.getAllByRole('columnheader')[1]
        await userEvent.click(familyHeader)

        expect(getNameCellsContent()).toEqual(['Sea Lion', 'Cat', 'Lion', 'Dog'])
      })

      test('sorts the whole collection', () => {
        render( <Table collection={ longCollection } columns={ columns } sortBy={{ column: 'family' }} />)

        expect(getNameCellsContent())
          .toEqual(['Dog', 'Red Fox', 'Cat', 'Lion', 'Gold Fish', 'Monkey', 'Sea Lion'])
      })
    })
  })
})