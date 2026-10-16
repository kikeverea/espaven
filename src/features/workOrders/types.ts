import type { PersistedRecord } from '@/types'
import type { Technician } from '@/features/users/types'
import type { Vehicle } from '@/features/vehicles/types'
import type { Schedulable } from '@/features/schedulables/types'
import type { ServiceWrite } from '@/features/services/types'

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
    entryKilometres?: number | null   // on the vehicle's dashboard as it comes in
  }

export type FormWorkOrder = Partial<WorkOrder> & {
  vehicleId?: Vehicle['id']
  services?: ServiceWrite[]     // to add to it or drop from it, as it is created or updated
}
