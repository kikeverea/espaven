import type { WorkOrder } from '@/features/workOrders/types'
import { useWorkOrderMutations } from '@/features/workOrders/useWorkOrders'
import { config } from '@/features/workOrders/data/workOrder.form'
import CardForm from '@/components/Form/CardForm'
import type { FormCallbacks } from '@/components/Form/Form'
import type { ComponentProps } from 'react'

type WorkOrderFormProps = FormCallbacks & ComponentProps<'div'> & {
  name: string
  workOrder: Partial<WorkOrder> | null
  className?: string
}

const WorkOrderForm = ({
  name='workOrder',
  workOrder,
  onCreate,
  onUpdate,
  onCancel,
  className
}: WorkOrderFormProps) => {

  return (
    <CardForm
      name={ name }
      className={ className }
      itemName={[ 'Orden de trabajo', 'f' ]}
      justify='fluid'
      config={ config }
      item={ workOrder }
      mutations={ useWorkOrderMutations() }
      onCreate={ onCreate }
      onUpdate={ onUpdate }
      onCancel={ onCancel }
    />
  )
}

export default WorkOrderForm
