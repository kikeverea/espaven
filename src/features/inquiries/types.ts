import type { Entity } from '@/types.ts'

export type Contact =
  Entity &
  {
    name: string
    lastName?: string
    emails?: string[]
    phoneNumbers?: string[]
  }
export type FormContact = Omit<Partial<Contact>, 'id'>

export type Inquiry =
  Entity &
  {
    service: string
    lastActivityAt: string
    accessed?: boolean
    status: InquiryStatus
    contact: Contact,
    comments?: Comment[]
  }

export type FormInquiry = Omit<Partial<Inquiry>, 'id'> & { contact: FormContact }

export type InquiryStatus =
  | 'pending'
  | 'contacted'
  | 'secondContact'

export type Comment = Entity & { body: string, createdBy: User }

export type InquiryComment = Comment & { inquiry: Inquiry }
export type FormInquiryComment = Omit<Partial<InquiryComment>, 'id'>

export type User = Entity & {
  name: string
  lastName?: string
  email: string
}