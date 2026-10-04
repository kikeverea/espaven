import { type ScheduleUnavailability, type FormScheduleUnavailability } from './types.ts'
import api from '@/features/unavailabilities/data/unavailability.api.ts'
import { resourceKeys, useMutations } from '@/lib/mutations.tsx'
import { useQuery } from '@tanstack/react-query'
import { endOfDay, startOfDay } from 'date-fns'

const unavailabilityKeys = resourceKeys('unavailabilities')

export const useUnavailabilityMutations = () =>
  useMutations<ScheduleUnavailability, FormScheduleUnavailability>(unavailabilityKeys, api)

export const useUnavailabilities = (day: Date) =>
  useQuery({
    queryKey: [unavailabilityKeys.all, day.toISOString()],
    queryFn: () => api.getAll(undefined, { from: startOfDay(day).toISOString(), to: endOfDay(day).toISOString() }),      // the day here, not the server's
  })