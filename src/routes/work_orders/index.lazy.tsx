import { createLazyFileRoute } from '@tanstack/react-router'
import WorkOrdersIndex from '@/features/workOrders/WorkOrdersIndex'

export const Route = createLazyFileRoute('/work_orders/')({
  component: () => <WorkOrdersIndex />
})
