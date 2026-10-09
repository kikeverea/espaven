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

  test('moves through dates and views from the charcoal toolbar', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => json({ collection: [] }))

    render(<SidebarProvider><CalendarIndex /></SidebarProvider>)

    const title = () => screen.getByRole('heading', { level: 2 }).textContent

    /* a week is titled by its month: by the day, each step tells */
    await vi.waitFor(() => expect(screen.getByRole('tab', { name: 'Semana' })).toHaveAttribute('aria-selected', 'true'))
    await user.click(screen.getByRole('tab', { name: 'Día' }))
    await vi.waitFor(() => expect(screen.getByRole('tab', { name: 'Día' })).toHaveAttribute('aria-selected', 'true'))

    const today = title()
    expect(screen.getByRole('button', { name: 'Hoy' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    await vi.waitFor(() => expect(title()).not.toBe(today))
    expect(screen.getByRole('button', { name: 'Hoy' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Anterior' }))
    await vi.waitFor(() => expect(title()).toBe(today))

    await user.click(screen.getByRole('tab', { name: 'Mes' }))
    await vi.waitFor(() => expect(screen.getByRole('tab', { name: 'Mes' })).toHaveAttribute('aria-selected', 'true'))
  })
})
