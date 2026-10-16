import { createLazyFileRoute } from '@tanstack/react-router'
import WorkOrderServices from '@/features/workOrders/services/WorkOrderServices'

export const Route = createLazyFileRoute('/work_orders/$id/services/')({
  component: WorkOrderServicesRoute,
})

function WorkOrderServicesRoute() {
  const { id } = Route.useParams()

  return <WorkOrderServices id={ Number(id) } />
}
