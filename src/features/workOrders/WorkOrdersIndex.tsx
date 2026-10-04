import { useEffect, useState } from 'react'
import WorkOrdersTimeline from '@/features/workOrders/timeline/WorkOrdersTimeline'
import WorkOrderDetails from '@/features/workOrders/details/WorkOrderDetails'
import { useWorkOrders, useWorkOrderMutations } from '@/features/workOrders/useWorkOrders'
import type { WorkOrder } from '@/features/workOrders/types'
import IndexNavBar from '@/components/NavBar/IndexNavBar'
import SideTray from '@/components/SideTray/SideTray'
import { useCollection } from '@/components/Table/useCollection'
import useTableQuery from '@/components/Table/hooks/useTableQuery'

const WorkOrdersIndex = () => {
  const query = useTableQuery()

  const mutations = useWorkOrderMutations()
  const [ selected, setSelected ] = useState<WorkOrder | null>(null)

  const { formItem: formWorkOrder } = useCollection(
    [ 'Orden de trabajo', 'f' ],
    useWorkOrders(query),
    mutations,
    query
  )

  /* Esc closes the details */
  useEffect(() => {
    if (!selected) return

    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }

    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [ selected ])

  return (
    <div className='flex w-full h-full'>
      <div className='min-w-0 flex-1 px-5 pb-8'>
        <IndexNavBar label='Órdenes de trabajo' createLabel='Crear orden de trabajo' form={ formWorkOrder } className='xl:hidden' />

        <div className='mt-4'>
          <WorkOrdersTimeline
            selectedId={ selected?.id }
            onSelect={ setSelected }
            mutations={ mutations }
          />
        </div>
      </div>

      <SideTray show={ !!selected } className='overflow-y-auto p-0'>
        { selected &&
          <WorkOrderDetails key={ selected.id } order={ selected } mutations={ mutations } onClose={() => setSelected(null)} />
        }
      </SideTray>
    </div>
  )
}

export default WorkOrdersIndex
