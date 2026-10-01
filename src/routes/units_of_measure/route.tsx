import { createFileRoute } from '@tanstack/react-router'
import { authorize } from '@/lib/ability.ts'

export const Route = createFileRoute('/units_of_measure')({
  beforeLoad: authorize('read', 'UnitOfMeasure'),
})
