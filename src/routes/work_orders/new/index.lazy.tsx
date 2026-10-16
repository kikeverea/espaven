import { createLazyFileRoute } from '@tanstack/react-router'
import WorkOrderServices from '@/features/workOrders/services/WorkOrderServices'

export const Route = createLazyFileRoute('/work_orders/new/')({
  component: () => <WorkOrderServices />,
})
