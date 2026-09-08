import { describe, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import { render } from '@/test/util'
import { SidebarProvider } from '@/components/ui/sidebar'
import { createFactories } from '@/test/factories'
import GenericPartsIndex from '@/features/genericParts/GenericPartsIndex.tsx'

describe('GenericPartsIndex', () => {

  const { genericPart } = createFactories()

  test('renders all parts', () => {
    const parts = [ genericPart({ name: 'Test 1' }), genericPart({ name: 'Test 2' }) ]

    /* The index reaches the sidebar through its NavBar */
    render(<SidebarProvider><GenericPartsIndex /></SidebarProvider>)

    const rows = screen.queryAllByRole('row')
    const dataRows = rows.slice(1)

    dataRows.forEach((row, ind) => {
      expect(within(row).getByText(parts[ind].name)).toBeInTheDocument()
      expect(within(row).getByText(parts[ind].inventoryCategory.name)).toBeInTheDocument()
    })
  })
})