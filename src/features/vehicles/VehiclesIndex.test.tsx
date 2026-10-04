import { describe, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import { render } from '@/test/render.tsx'
import { SidebarProvider } from '@/components/ui/sidebar'
import { createFactories } from '@/test/factories'
import VehiclesIndex from '@/features/vehicles/VehiclesIndex.tsx'

describe('VehiclesIndex', () => {

  const { vehicle } = createFactories()

  test('renders all vehicles', () => {
    const vehicles = [ vehicle({ plateNumber: 'Test 1' }), vehicle({ plateNumber: 'Test 2' }) ]

    /* The index reaches the sidebar through its NavBar */
    render(<SidebarProvider><VehiclesIndex /></SidebarProvider>)

    const rows = screen.queryAllByRole('row')
    const dataRows = rows.slice(1)

    dataRows.forEach((row, ind) => {
      expect(within(row).getByText(vehicles[ind].plateNumber!)).toBeInTheDocument()
    })
  })
})
