import { createLazyFileRoute } from '@tanstack/react-router'
import VehicleListingForm from '@/features/vehicleListings/form/VehicleListingForm'

export const Route = createLazyFileRoute('/vehicle_listings/$id/')({
  component: VehicleListingRoute,
})

function VehicleListingRoute() {
  const { id } = Route.useParams()

  return <VehicleListingForm id={ Number(id) } />
}
