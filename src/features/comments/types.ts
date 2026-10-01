import type { User } from '@/features/users/types'
import type { PersistedRecord } from '@/types'

export type Comment = PersistedRecord & { body: string, createdBy: User }