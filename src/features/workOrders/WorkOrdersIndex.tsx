import { useEffect, useState } from 'react'
import WorkOrdersTimeline from '@/features/workOrders/timeline/WorkOrdersTimeline'
import WorkOrderDetails from '@/features/workOrders/details/WorkOrderDetails'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useWorkOrderMutations } from '@/features/workOrders/useWorkOrders'
import type { WorkOrder } from '@/features/workOrders/types'
import NavBar from '@/components/NavBar/NavBar'
import SideTray from '@/components/SideTray/SideTray'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const WorkOrdersIndex = () => {
  const mutations = useWorkOrderMutations()
  const [ selected, setSelected ] = useState<WorkOrder | null>(null)

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
        <NavBar
          label='Órdenes de reparación'
          action={
            <Link to='/work_orders/new' className={ cn(buttonVariants(), 'me-2 bg-amber-600 px-4 py-4 text-white hover:bg-amber-700') }>
              <Plus className='size-4' /> Crear orden de reparación
            </Link>
          }
        />

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
