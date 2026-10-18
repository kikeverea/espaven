import { createLazyFileRoute } from '@tanstack/react-router'
import VehicleListingsIndex from '@/features/vehicleListings/VehicleListingsIndex'

export const Route = createLazyFileRoute('/vehicle_listings/')({
  component: () => <VehicleListingsIndex />,
})
