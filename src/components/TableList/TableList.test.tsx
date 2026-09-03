import { describe, expect } from 'vitest'
import { render } from '@/test/util'
import TableList, { type TableListEntry } from '@/components/TableList/TableList'
import { screen } from '@testing-library/react'

describe('TableList', () => {

  test('should render TableList', () => {

    const entries = [
      ['Test 1', 'Value 1'],
      ['Test 2', 'Value 2'],
      ['Test 3', 'Value 3'],
    ] satisfies TableListEntry[]

    render(<TableList entries={ entries }/>)

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(entries.length)

    entries.forEach(entry => {
      entry.forEach(value => {
        expect(screen.getByText(value)).toBeInTheDocument()
      })
    })
  })
})