import { render, screen } from '@testing-library/react'
import { expect } from 'vitest'
import CommentList from '@/features/comments/CommentList.tsx'
import { createFactories } from '@/test/factories.ts'

describe('Comment List', () => {

  const { comment } = createFactories()
  const commentList = Array.from({ length: 3 }, (_, i) => comment({ body: `Comment ${i}`}))

  test('renders empty message', () => {
    render(<CommentList comments={ [] }/>)
    expect(screen.getByText(/no hay comentarios/i)).toBeInTheDocument()
  })

  test('doesnt render empty message is show empty message is false', () => {
    render(<CommentList comments={ [] } showEmptyMessage={ false }/>)
    expect(screen.queryByText(/no hay comentarios/i)).not.toBeInTheDocument()
  })

  test('renders comments', () => {
    render(<CommentList comments={ commentList }/>)

    commentList.forEach(listComment =>
      expect(screen.getByText(listComment.body)).toBeInTheDocument())
  })
})