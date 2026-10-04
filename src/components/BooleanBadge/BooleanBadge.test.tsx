import { describe } from 'vitest'
import { render } from '@/test/render.tsx'
import { screen } from '@testing-library/react'
import BooleanBadge from '@/components/BooleanBadge/BooleanBadge.tsx'

describe('BooleanBadge', () => {

  test('renders default message for true', () => {
    render(<BooleanBadge bool={ true } />)
    expect(screen.getByText(/sí/i)).toBeInTheDocument()
  })

  test('renders default message for false', () => {
    render(<BooleanBadge bool={ false } />)
    expect(screen.getByText(/no/i)).toBeInTheDocument()
  })

  test('renders message for true', () => {
    render(<BooleanBadge bool={ true } trueMessage='render this' falseMessage='do not' />)
    expect(screen.getByText(/render this/i)).toBeInTheDocument()
  })

  test('renders message for false', () => {
    render(<BooleanBadge bool={ false } falseMessage='render this' trueMessage='do not' />)
    expect(screen.getByText(/render this/i)).toBeInTheDocument()
  })

})