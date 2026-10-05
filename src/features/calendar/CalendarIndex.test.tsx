import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setHours, startOfDay } from 'date-fns'
import { render } from '@/test/render.tsx'
import { createFactories } from '@/test/factories'
import { SidebarProvider } from '@/components/ui/sidebar'
import CalendarIndex from '@/features/calendar/CalendarIndex'

describe('CalendarIndex', () => {

  const { workOrder } = createFactories()

  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })

  afterEach(() => { vi.restoreAllMocks() })

  test('shows the week’s work orders, and opens one in the side tray', async () => {
    const order = workOrder({ number: 'OT-1', name: 'Frenos', scheduledAt: setHours(startOfDay(new Date()), 10).toISOString(), labourMinutes: 60 })

    vi.spyOn(globalThis, 'fetch').mockImplementation(async input => {
      const { pathname } = new URL(String(input))

      if (pathname.endsWith('/work_orders')) return json({ collection: [ { ...order, status: 'not_started' } ] })
      if (pathname.endsWith(`/work_orders/${order.id}`)) return json({ ...order, status: 'not_started' })
      return json({ collection: [] })
    })

    /* the page reaches the sidebar through its NavBar */
    render(<SidebarProvider><CalendarIndex /></SidebarProvider>)

    await userEvent.setup().click(await screen.findByText('OT-1 · Frenos'))

    expect(await screen.findByRole('heading', { name: 'Frenos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar detalles' })).toBeInTheDocument()
  })
})
