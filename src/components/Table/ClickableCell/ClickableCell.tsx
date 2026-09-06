import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

type ClickableCellProps = {
  link?: string,
  children?: ReactNode
}

const ClickableCell = ({ link, children }: ClickableCellProps) =>
  link ? <Link to={ link }> { children } </Link> : children

export default ClickableCell