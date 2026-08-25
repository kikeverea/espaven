import type { Record } from '@/types.ts'

export type Contact =
  Record &
  {
    name: string
    lastName?: string
    emails?: string[]
    phoneNumbers?: string[]
  }
export type FormContact = Omit<Partial<Contact>, 'id'>

export type Inquiry =
  Record &
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

export type Comment = Record & { body: string, createdBy: User }

export type InquiryComment = Comment & { inquiry: Inquiry }
export type FormInquiryComment = Omit<Partial<InquiryComment>, 'id'>

export type User = Record & {
  name: string
  lastName?: string
  email: string
}