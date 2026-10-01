import type { PersistedRecord } from '@/types'
import type { Technician } from '@/features/users/types'
import type { Vehicle } from '@/features/vehicles/types'

export type WorkOrder =
  PersistedRecord &
  {
    number: string
    stage: string
    status: string
    technician: Technician
    vehicle: Vehicle
    totalMinutes: number
  }

export type FormWorkOrder = Partial<WorkOrder>
