import type { User } from '@/features/inquiries/types'
import type { PersistedRecord } from '@/types'

export type Comment = PersistedRecord & { body: string, createdBy: User }