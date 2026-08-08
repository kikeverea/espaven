import type { TestData } from '@/lib/testUtils.ts'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SortingHeader from './SortingHeader.tsx'
import type { TableColumn } from '@/components/Table/types.ts'

describe('SortingHeader', () => {

  const columns: TableColumn<TestData>[] = [
    { name: 'Name', accessor: item => item.name },
    { name: 'Family', accessor: item => item.family },
    { name: 'Type', accessor: item => item.type },
  ]

  const setSortColumnMock = vi.fn()

  afterEach(() => {
    setSortColumnMock.mockClear()
  })

  describe('Sorting', () => {
    test('toggles sort direction when clicking the sorting header', async () => {
      render(<SortingHeader columns={ columns } setSortColumn={ setSortColumnMock } />)

      const [_name, family] = screen.getAllByRole('columnheader')
      await userEvent.click(family)

      expect(setSortColumnMock).toHaveBeenLastCalledWith('family')
    })
  })
})