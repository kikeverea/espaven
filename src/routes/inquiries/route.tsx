import { createFileRoute } from '@tanstack/react-router'
import { authorize } from '@/lib/ability.ts'

export const Route = createFileRoute('/inquiries')({
  beforeLoad: authorize('read', 'Inquiry'),
})
