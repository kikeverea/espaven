import WorkOrdersTimeline from '@/features/workOrders/timeline/WorkOrdersTimeline'
import { useWorkOrders, useWorkOrderMutations } from '@/features/workOrders/useWorkOrders'
import IndexNavBar from '@/components/NavBar/IndexNavBar'
import { useCollection } from '@/components/Table/useCollection'
import useTableQuery from '@/components/Table/hooks/useTableQuery'

const WorkOrdersIndex = () => {
  const query = useTableQuery()

  const mutations = useWorkOrderMutations()

  const { formItem: formWorkOrder } = useCollection(
    [ 'Orden de trabajo', 'f' ],
    useWorkOrders(query),
    mutations,
    query
  )

  return (
    <div className='flex w-full h-full'>
      <div className='min-w-0 flex-1 px-5 pb-8'>
        <IndexNavBar label='Órdenes de trabajo' createLabel='Crear orden de trabajo' form={ formWorkOrder } className='xl:hidden' />

        <div className='mt-4'>
          <WorkOrdersTimeline
            onSelect={ id => formWorkOrder.set(id) }
            mutations={ mutations }
          />
        </div>
      </div>
    </div>
  )
}

export default WorkOrdersIndex
