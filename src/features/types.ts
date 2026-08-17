import type { Entity } from '@/types.ts'

export type Contact = {
  name: string
  lastName: string
  emails: string[]
  phoneNumbers: string[]
}

export type Inquiry = Entity & {
  status: InquiryStatus
  contact: Contact
  service: string
  lastActivityAt: string
  createdAt: string
  accessed: boolean
}

export type NewInquiry = Partial<Omit<Inquiry, 'id'>>

export type InquiryStatus =
  | 'new'
  | 'contacted'
  | 'secondContact'