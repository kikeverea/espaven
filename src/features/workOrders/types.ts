import type { PersistedRecord } from '@/types'
import type { Technician } from '@/features/users/types'
import type { Vehicle } from '@/features/vehicles/types'
import type { Schedulable } from '@/features/schedulables/types'

export type WorkOrder =
  PersistedRecord &
  Schedulable &
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
    workedMinutes: number
  }

export type FormWorkOrder = Partial<WorkOrder>
