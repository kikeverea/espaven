import { createLazyFileRoute } from '@tanstack/react-router'
import VehiclesIndex from '@/features/vehicles/VehiclesIndex'

export const Route = createLazyFileRoute('/vehicles/')({
  component: () => <VehiclesIndex />
})
