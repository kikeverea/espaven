import type { Contact, Inquiry, User } from '@/features/inquiries/types'
import type { Comment } from '@/features/comments/types'

export const createFactories = () => {
  const ids = {
    user: 1,
    contact: 1,
    inquiry: 1,
    comment: 1,
  }

  const now = () => new Date().toISOString()

  const user = (args: Partial<User> = {}): User => ({
    id: ids.user++,
    fullName: 'Test',
    lastName: 'User',
    email: 'test@user.com',
    createdAt: now(),
    ...args,
  })

  const contact = (args: Partial<Contact> = {}): Contact => ({
    id: ids.contact++,
    name: 'Test',
    lastName: 'Contact',
    emails: ['test@contact.com'],
    phoneNumbers: ['555 555 555'],
    createdAt: now(),
    ...args,
  })

  const inquiry = (args: Partial<Inquiry> = {}): Inquiry => ({
    id: ids.inquiry++,
    contact: contact(),
    service: 'Test service',
    status: 'contacted',
    lastActivityAt: now(),
    accessed: true,
    comments: [],
    createdAt: now(),
    ...args,
  })

  const comment = (args: Partial<Comment> = {}): Comment => ({
    id: ids.comment++,
    body: 'Test comment',
    createdAt: now(),
    createdBy: user(),
    ...args
  })

  return { contact, comment, inquiry, user }
}