import { render, screen } from '@testing-library/react'
import { beforeEach, expect } from 'vitest'
import { type Comment as CommentType } from '@/features/comments/types'
import Comment from '@/features/comments/Comment'
import { createFactories } from '@/test/factories.ts'
import { timeString } from '@/lib/strings.ts'

describe('Comment', () => {

  const { comment } = createFactories()
  let testComment: CommentType

  beforeEach(() => {
    testComment = comment()
  })

  test('renders comment body', () => {
    render(<Comment comment={ testComment }/>)

    const body = testComment.body
    expect(screen.getByText(body)).toBeInTheDocument()
  })

  test('renders comment creator initial', () => {
    render(<Comment comment={ testComment }/>)

    const initial = testComment.createdBy.fullName.charAt(0)
    expect(screen.getByText(initial)).toBeInTheDocument()
  })

  test('renders comment creation date', () => {
    render(<Comment comment={ testComment }/>)

    const createdAt = timeString(testComment.createdAt)
    expect(screen.getByText(createdAt)).toBeInTheDocument()
  })
})