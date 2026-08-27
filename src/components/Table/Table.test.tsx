import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Table from './Table.tsx'
import type { TableColumn } from '@/components/Table/types'
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

  const filterColumns: FilterColumns = [ 'Family', 'Type', ['Age', 'range'], ['Birth', 'range', parseDate] ]
  const filterAnd = (args?: UpdateFilterArgs) => newFilter(filterColumns, args, longCollection)

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
      const rowCheckbox = rowCheckboxes[Math.round(Math.random() * rowCheckboxes.length)]

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

      const noButtons = screen.queryAllByRole('button')
      expect(noButtons).toHaveLength(0)

      const [_header, body] = screen.getAllByRole('rowgroup')
      const rowCheckboxes = within(body).getAllByRole('checkbox')
      const rowCheckbox = rowCheckboxes[Math.round(Math.random() * rowCheckboxes.length)]

      await userEvent.click(rowCheckbox)

      const buttons = screen.getByRole('button')
      expect(buttons).toBeInTheDocument()
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

    describe('Pagination', () => {

      test('paginates data', () => {
        render(<Table collection={ collection } columns={ columns } paginate={ 2 }/>)

        expect(getNameCellsContent()).toEqual(['Cat', 'Dog'])
      })

      test('render the selected page data', async () => {
        render(<Table collection={ collection } columns={ columns } paginate={ 2 }/>)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')
        const pageNumbers = within(paginationNavigation).getAllByRole('listitem')

        await userEvent.click(pageNumbers[1])

        expect(getNameCellsContent()).toEqual(['Lion', 'Sea Lion'])
      })

      test('left arrow navigates to previous page', async () => {
        render(<Table collection={ longCollection } columns={ columns } paginate={ 1 } page={ 4 } />)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')

        const leftArrow = within(paginationNavigation).getByLabelText('Go to previous page')
        await userEvent.click(leftArrow)

        const expectedPage = 3
        expect(getNameCellsContent()).toEqual([longCollection[expectedPage].name])
      })

      test('right arrow navigates to next page', async () => {
        render(<Table collection={ longCollection } columns={ columns } paginate={ 1 } page={ 4 } />)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')

        const rightArrow = within(paginationNavigation).getByLabelText('Go to next page')
        await userEvent.click(rightArrow)

        const expectedPage = 5
        expect(getNameCellsContent()).toEqual([longCollection[expectedPage].name])
      })

      test('selecting items per page renders that amount of items', async () => {
        render(<Table collection={ longCollection } columns={ columns } paginate={ 2 } />)

        const paginationNavigation = screen.getByLabelText('Pagination Navigation')
        const itemsPerPageSelect = within(paginationNavigation).getByRole('combobox')

        await userEvent.selectOptions(itemsPerPageSelect, '10')

        const rows = dataRows()
        expect(rows).toHaveLength(Math.min(longCollection.length, 10))
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

      test('sorts a filtered, paginated collection', () => {
        render(<Table collection={ collection } columns={ columns } sortBy={{ column: 'family' }} paginate={ 2 } />)

        expect(getNameCellsContent()).toEqual(['Dog', 'Cat'])
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

      test('sorts a paginated collection', () => {
        render( <Table collection={ longCollection } columns={ columns } sortBy={{ column: 'family' }} paginate={ 2 } />)

        expect(getNameCellsContent()).toEqual(['Dog', 'Cat'])
      })
    })
  })
})