import { createLazyFileRoute } from '@tanstack/react-router'
import CalendarIndex from '@/features/calendar/CalendarIndex'

export const Route = createLazyFileRoute('/calendar/')({
  component: () => <CalendarIndex />
})
