import { screen } from '@testing-library/react'
import { AbilityProvider } from '@casl/react'
import { createMongoAbility } from '@casl/ability'
import { Inbox } from 'lucide-react'
import { render } from '@/test/render.tsx'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar/AppSidebar.tsx'
import { rulesFor, type AppAbility } from '@/lib/ability'
import type { Role } from '@/features/users/types'
import NewInquiriesBlinker from '@/features/inquiries/NewInquiriesBlinker.tsx'

describe('NewInquiriesBlinker', () => {

  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

  /* the api answers whether there is a new inquiry; the rest it is not asked */
  const serve = (hasNew: boolean) =>
    vi.spyOn(globalThis, 'fetch').mockImplementation(async input =>
      new URL(String(input)).pathname.endsWith('/inquiries/has_new') ? json({ has_new: hasNew }) : json({}, 404))

  afterEach(() => { vi.restoreAllMocks() })

  const renderSidebar = (role: Role = 'admin') =>
    render(
      <AbilityProvider value={ createMongoAbility<AppAbility>(rulesFor(role)) }>
        <SidebarProvider>
          <AppSidebar struct={{
            CRM: [ { label: 'Solicitudes', path: '/inquiries', icon: <Inbox />, subject: 'Inquiry', badge: <NewInquiriesBlinker /> } ],
          }} />
        </SidebarProvider>
      </AbilityProvider>
    )

  test('blinks on the Solicitudes link while there is a new inquiry', async () => {
    serve(true)
    renderSidebar()

    expect(await screen.findByTestId('blinker')).toBeInTheDocument()
  })

  test('does not blink when there is none', async () => {
    const fetch = serve(false)
    renderSidebar()

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/inquiries\/has_new$/), expect.anything()))
    expect(screen.queryByTestId('blinker')).not.toBeInTheDocument()
  })

  test('asks nothing for who cannot see inquiries', () => {
    const fetch = serve(true)
    renderSidebar('technician')

    expect(screen.queryByText('Solicitudes')).not.toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })
})
