import { describe, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createFactories } from '@/test/factories'
import Table from '@/components/Table/Table'
import type { TableColumn } from '@/components/Table/types.ts'
import type { Inquiry } from '@/features/inquiries/types.ts'

describe('InquiriesIndex', () => {

  const { inquiry } = createFactories()

  const columns: TableColumn<Inquiry>[] = [
    { name: 'Service', accessor: 'service' },
    { name: 'Last activity', accessor: 'lastActivityAt' },
  ]

  test('renders blinker when inquiry lastActivityAt is null', () => {
    const inquiries = [ inquiry(), inquiry({ lastActivityAt: null }) ]

    render(<Table
      collection={ inquiries }
      columns={ columns }
      blink={ inquiry => !!inquiry.lastActivityAt }
    />)

    expect(screen.getByTestId('blinker')).toBeInTheDocument()
  })
})