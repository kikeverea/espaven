import { describe, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import { render } from '@/test/render.tsx'
import { SidebarProvider } from '@/components/ui/sidebar'
import { createFactories } from '@/test/factories'
import SuppliersIndex from '@/features/suppliers/SuppliersIndex.tsx'

describe('SuppliersIndex', () => {

  const { supplier } = createFactories()

  test('renders all suppliers', () => {
    const suppliers = [ supplier({ name: 'Test 1' }), supplier({ name: 'Test 2' }) ]

    /* The index reaches the sidebar through its NavBar */
    render(<SidebarProvider><SuppliersIndex /></SidebarProvider>)

    const rows = screen.queryAllByRole('row')
    const dataRows = rows.slice(1)

    dataRows.forEach((row, ind) => {
      expect(within(row).getByText(suppliers[ind].name)).toBeInTheDocument()
    })
  })
})
