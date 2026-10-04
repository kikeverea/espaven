import { describe, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import { render } from '@/test/render.tsx'
import { SidebarProvider } from '@/components/ui/sidebar'
import { createFactories } from '@/test/factories'
import WorkOrdersIndex from '@/features/workOrders/WorkOrdersIndex.tsx'

describe('WorkOrdersIndex', () => {

  const { workOrder } = createFactories()

  test('renders all workOrders', () => {
    const workOrders = [ workOrder({ number: 'Test 1' }), workOrder({ number: 'Test 2' }) ]

    /* The index reaches the sidebar through its NavBar */
    render(<SidebarProvider><WorkOrdersIndex /></SidebarProvider>)

    const rows = screen.queryAllByRole('row')
    const dataRows = rows.slice(1)

    dataRows.forEach((row, ind) => {
      expect(within(row).getByText(workOrders[ind].number)).toBeInTheDocument()
    })
  })
})
