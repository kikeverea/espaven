import { describe, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { createFactories } from '@/test/factories'
import Table from '@/components/Table/Table'
import type { TableColumn } from '@/components/Table/types.ts'
import type { InventoryCategory } from '@/features/inventoryCategories/types.ts'

describe('ServiceTemplatesIndex', () => {

  const { inventoryCategory } = createFactories()

  const columns: TableColumn<InventoryCategory>[] = [
    { name: 'Nombre', accessor: 'name' },
    { name: 'SIGAUS', accessor: 'appliesSigaus' },
  ]

  test('renders all categories', () => {
    const categories = [ inventoryCategory(), inventoryCategory({ appliesSigaus: true }) ]

    render(<Table collection={ categories } columns={ columns }/>)

    const rows = screen.queryAllByRole('row')
    const dataRows = rows.slice(1)

    dataRows.forEach((row, ind) => {
      expect(within(row).getByRole('checkbox')).toBeInTheDocument()
      expect(within(row).getByText(categories[ind].name)).toBeInTheDocument()
    })
  })
})