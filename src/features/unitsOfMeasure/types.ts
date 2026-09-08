import type { PersistedRecord } from '@/types'

export type UnitOfMeasure = PersistedRecord & {
  name: string
}
export type FormUnitOfMeasure = Omit<Partial<UnitOfMeasure>, 'id'>