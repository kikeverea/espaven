import ClickableCell from '@/components/Table/ClickableCell/ClickableCell.tsx'
import { render } from '@/test/util.tsx'
import { expect } from 'vitest'
import { screen } from '@testing-library/react'

describe('ClickableCell', () => {

  it('renders a link tag if link is passed', () => {
    render(<ClickableCell link='/'/>)
    expect(screen.getByRole('link')).toBeInTheDocument()
  })

})