import type { PersistedRecord } from '@/types'
import type { Technician } from '@/features/users/types'
import type { Vehicle } from '@/features/vehicles/types'

export type WorkOrder =
  PersistedRecord &
  {
    name: string
    number: string
    stage: 'quote' | 'order' | 'invoice'
    status:
      | 'pendingTechnician'
      | 'notStarted'
      | 'inProgress'
      | 'paused'
      | 'completed'
      | 'archived'
    technicians?: Technician[]
    vehicle: Vehicle
    labourMinutes: number
    workedMinutes: number
    scheduledAt?: string | null      // ISO, when the work starts. Unscheduled while null
  }

export type FormWorkOrder = Partial<WorkOrder>
