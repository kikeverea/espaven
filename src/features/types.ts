import type { Entity } from '@/types.ts'

export type Contact = {
  name: string
  lastName: string
  emails: string[]
  phoneNumbers: string[]
  address: string
}

export type Lead = Contact & {
  inquiries?: Inquiry[]
}
export type NewLead = Omit<Lead, 'id'>

export type Inquiry = Entity & {
  status: string
  accessed: boolean
  contact: Contact
  service: string
  lastActivity: string
  created: string
}
export type NewInquiry = Omit<Inquiry, 'id'>
