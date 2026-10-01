import * as z from 'zod'
import { defineFormConfig } from '@/components/Form/util.ts'
import type { FormWorkOrder, WorkOrder } from '@/features/workOrders/types.ts'
import type { InferSchema } from '@/components/Form/types.ts'

const fields = {
  number: {
    label: 'Número',
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres'),
  },
  stage: {
    label: 'Etapa',
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres'),
  },
  status: {
    label: 'Estado',
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres'),
  },
  technicianId: {
    label: 'Técnico',
    schema: z.coerce.number().min(0, 'No puede ser menor de 0'),
  },
  vehicleId: {
    label: 'Vehículo',
    schema: z.coerce.number().min(0, 'No puede ser menor de 0'),
  },
  totalMinutes: {
    label: 'Minutos',
    schema: z.coerce.number().min(0, 'No puede ser menor de 0'),
  },
}

export const config = defineFormConfig<WorkOrder, FormWorkOrder, typeof fields>({
  fields,
  toFormData: (workOrder: WorkOrder): InferSchema<typeof fields> => {
    const { technician, vehicle, ...rest } = workOrder
    return { ...rest, technicianId: technician?.id, vehicleId: vehicle?.id }
  },
})
