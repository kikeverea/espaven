import { createFileRoute } from '@tanstack/react-router'
import { authorize } from '@/lib/ability.ts'

export const Route = createFileRoute('/service_templates')({
  beforeLoad: authorize('read', 'ServiceTemplate'),
})
