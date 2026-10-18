import { createFileRoute } from '@tanstack/react-router'
import { authorize } from '@/lib/ability.ts'

export const Route = createFileRoute('/vehicle_listings')({
  beforeLoad: authorize('read', 'VehicleListing'),
})
