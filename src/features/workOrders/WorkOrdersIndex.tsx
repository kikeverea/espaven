import { useWorkOrders, useWorkOrderMutations } from '@/features/workOrders/useWorkOrders'
import type { TableColumn } from '@/components/Table/types'
import type { WorkOrder } from '@/features/workOrders/types.ts'
import Table from '@/components/Table/Table'
import { Pencil, Plus, Trash, X } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import NavBar from '@/components/NavBar/NavBar.tsx'
import { useCollection } from '@/components/Table/useCollection.tsx'
import useTableQuery from '@/components/Table/hooks/useTableQuery'
import { batchDelete } from '@/components/Table/util.tsx'
import WorkOrderForm from '@/features/workOrders/WorkOrderForm.tsx'

const WorkOrdersIndex = () => {
  const query = useTableQuery()

  const {
    collection: workOrders = [],
    server,
    formItem: formWorkOrder,
    isLoading,
    remove,
    removeAll
  } = useCollection(
    [ 'Orden de trabajo', 'f' ],
    useWorkOrders(query),
    useWorkOrderMutations(),
    query
  )

  // TODO: check the columns. `sortKey` is what the api calls the column
  const columns: TableColumn<WorkOrder>[] = [
    { name: 'Número', accessor: 'number', sortKey: 'number' },
    { name: 'Etapa', accessor: 'stage', sortKey: 'stage' },
    { name: 'Estado', accessor: 'status', sortKey: 'status' },
    { name: 'Minutos', accessor: 'totalMinutes', sortKey: 'total_minutes' },
  ]

  return (
    <div className='flex w-full h-full'>
      <div className='min-w-0 flex-1 px-5 pb-8'>
        <NavBar
          label='Órdenes de trabajo'
          action={!formWorkOrder.get()
            ? <Button
              variant='primary'
              className='me-2 px-4 py-4 lg:hidden'
              onClick={() => formWorkOrder.set({} as WorkOrder)}
            >
              <Plus className='size-4' /> Crear orden de trabajo
            </Button>
            : <Button className='me-2 text-[13px] py-4 lg:hidden' onClick={() => formWorkOrder.set(null) }>
              <X className='size-4' /> Cerrar
            </Button>
          }
        />

        <WorkOrderForm
          name='mobile-work-order'
          className='xl:hidden'
          workOrder={ formWorkOrder.get() || {} }
          onCancel={() => formWorkOrder.set(null)}
        />

        <div className='py-3 flex-1 flex gap-6 my-4 items-start'>
          <div className='lg:flex-1'>
            <Table
              collection={ workOrders }
              server={ server }
              isLoading={ isLoading }
              columns={ columns }
              noEntriesMessage='No hay órdenes de trabajo'
              selectable={ true }
              actions={[
                { label: 'Editar', icon: <Pencil />, action: id => formWorkOrder.set(id) },
                { label: 'Eliminar', icon: <Trash />, action: id => remove(id), destructive: true },
              ]}
              selectionActions={removeAll
                ? [batchDelete<WorkOrder>(removeAll, 'Órdenes de trabajo eliminadas')]
                : []
              }
            />
          </div>
          <div className='lg:flex-1'>
            <WorkOrderForm
              name='desktop-work-order'
              className='hidden xl:block xl:flex-1'
              workOrder={ formWorkOrder.get() || {} }
              onCancel={() => formWorkOrder.set(null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkOrdersIndex
