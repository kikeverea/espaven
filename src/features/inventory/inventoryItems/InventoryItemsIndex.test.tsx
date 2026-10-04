import { describe, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import { render } from '@/test/render.tsx'
import { SidebarProvider } from '@/components/ui/sidebar.tsx'
import { createFactories } from '@/test/factories.ts'
import InventoryItemsIndex from '@/features/inventory/inventoryItems/InventoryItemsIndex.tsx'

describe('InventoryItemsIndex', () => {

  const { inventoryItem } = createFactories()

  test('renders all parts', () => {
    const parts = [ inventoryItem({ name: 'Test 1' }), inventoryItem({ name: 'Test 2' }) ]

    /* The index reaches the sidebar through its NavBar */
    render(<SidebarProvider><InventoryItemsIndex /></SidebarProvider>)

    const rows = screen.queryAllByRole('row')
    const dataRows = rows.slice(1)

    dataRows.forEach((row, ind) => {
      expect(within(row).getByText(parts[ind].name)).toBeInTheDocument()
      expect(within(row).getByText(parts[ind].inventoryCategory.name)).toBeInTheDocument()
    })
  })
})