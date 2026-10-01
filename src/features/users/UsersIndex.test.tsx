import { describe, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import { render } from '@/test/util'
import { SidebarProvider } from '@/components/ui/sidebar'
import { createFactories } from '@/test/factories'
import UsersIndex from '@/features/users/UsersIndex.tsx'

describe('UsersIndex', () => {

  const { user } = createFactories()

  test('renders all users', () => {
    const users = [ user({ fullName: 'Test 1' }), user({ fullName: 'Test 2' }) ]

    /* The index reaches the sidebar through its NavBar */
    render(<SidebarProvider><UsersIndex /></SidebarProvider>)

    const rows = screen.queryAllByRole('row')
    const dataRows = rows.slice(1)

    dataRows.forEach((row, ind) => {
      expect(within(row).getByText(users[ind].fullName)).toBeInTheDocument()
    })
  })
})
