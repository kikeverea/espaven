import type { PersistedRecord } from '@/types'
import type { Comment } from '@/features/comments/types'

export type Contact =
  PersistedRecord &
  {
    name: string
    lastName?: string
    emails?: { address: string, primary?: boolean }[]
    phoneNumbers?: { number: string, primary?: boolean }[]
  }
export type FormContact = Partial<Contact>

export type Inquiry =
  PersistedRecord &
  {
    service: string
    status: InquiryStatus
    contact: Contact,
    comments?: Comment[]
    discardedAt: string | null
    lastActivityAt: string | null
  }

export type FormInquiry = Partial<Inquiry> & { contact?: FormContact } & Record<string, unknown>

export type InquiryStatus =
  | 'pending'
  | 'contacted'
  | 'secondContact'

export type InquiryComment = Comment & { inquiry: Inquiry }
export type FormInquiryComment = Omit<Partial<InquiryComment>, 'id'>

export type User = PersistedRecord & {
  fullName: string
  lastName?: string
  email: string
}