import type { FormScheduleUnavailability, ScheduleUnavailability } from '../types'
import { createResource } from '@/api/resource.ts'

export default createResource<ScheduleUnavailability, FormScheduleUnavailability>('/schedule_unavailabilities')
