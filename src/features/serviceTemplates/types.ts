import type { PersistedRecord } from '@/types'

export type ServiceTemplate =
  & PersistedRecord
  & {
    name: string
    expectedMinutes: number
    priceCents: number
    discardedAt?: string
    parent?: ServiceTemplate
  }

export type FormServiceTemplate = Omit<Partial<ServiceTemplate>, 'parent'>