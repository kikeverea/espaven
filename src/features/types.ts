import type { Entity } from '@/types.ts'

export type Contact = Entity & {
  name: string
  lastName?: string
  emails?: string[]
  phoneNumbers?: string[]
}

export type Inquiry = Entity & {
  status: InquiryStatus
  contact: Contact
  service: string
  lastActivityAt: string
  accessed?: boolean
  comments?: Comment[]
}
export type NewInquiry = Partial<Omit<Inquiry, 'id'>>

export type InquiryStatus =
  | 'pending'
  | 'contacted'
  | 'secondContact'

export type Comment = Entity & { body: string, createdBy: User }
export type NewComment = Partial<Omit<Comment, 'id'>>

export type InquiryComment = Comment & { inquiry: Inquiry }
export type NewInquiryComment = Partial<Omit<InquiryComment, 'id'>>

export type User = Entity & {
  name: string
  lastName?: string
  email: string
}