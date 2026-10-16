import type { PersistedRecord } from '@/types'

export type Supplier =
  PersistedRecord &
  {
    name: string
    city?: string
    phone?: string
    email?: string
    color: string
  }

export type FormSupplier = Partial<Supplier>
