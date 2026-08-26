import type { User } from '@/features/inquiries/types'
import type { Record } from '@/types'

export type Comment = Record & { body: string, createdBy: User }