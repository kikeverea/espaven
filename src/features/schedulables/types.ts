/* Anything that takes a stretch of the workshop's time: a work order, a service */
export type Schedulable = {
  scheduledAt?: string | null      // ISO, when the work starts. Unscheduled while null
  labourMinutes: number
}
