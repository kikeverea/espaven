import type { PersistedRecord } from '@/types'
import type { Technician } from '@/features/users/types'

export type ScheduleUnavailability =
  PersistedRecord &
  {
    technician?: Pick<Technician, 'id' | 'fullName'> | null
    startsAt: string          // ISO
    endsAt: string            // ISO
    reason?: string | null
  }

export type FormScheduleUnavailability = Partial<ScheduleUnavailability>
