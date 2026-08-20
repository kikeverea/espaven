import { screen } from '@testing-library/react'
import { beforeEach, expect } from 'vitest'
import InquiryComments from '@/features/inquiries/comments/InquiryComments.tsx'
import userEvent from '@testing-library/user-event'
import { createFactories } from '@/test/factories.ts'
import { render } from '@/test/util.tsx'

describe('Comments', () => {

  const { inquiry } = createFactories()

  beforeEach(() => {
    render(<InquiryComments inquiry={ inquiry() }/>)
  })

  test('renders title', () => {
    const title = screen.getByRole('heading', { name: /comentarios/i })
    expect(title).toBeInTheDocument()
  })

  test('pressing add comment shows form', async () => {
    expect(screen.queryByRole('form')).not.toBeInTheDocument()

    const addButton = screen.getByRole('button', { name: /añadir|nuevo/i })
    await userEvent.click(addButton)

    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  test('pressing add comment hides empty comments message', async () => {
    expect(screen.queryByText(/no hay comentarios/i)).toBeInTheDocument()

    const addButton = screen.getByRole('button', { name: /añadir|nuevo/i })
    await userEvent.click(addButton)

    expect(screen.queryByText(/no hay comentarios/i)).not.toBeInTheDocument()
  })
})