import { createLazyFileRoute } from '@tanstack/react-router'
import VehicleListingForm from '@/features/vehicleListings/form/VehicleListingForm'

export const Route = createLazyFileRoute('/vehicle_listings/new/')({
  component: () => <VehicleListingForm />,
})
