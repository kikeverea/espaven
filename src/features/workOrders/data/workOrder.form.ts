import * as z from 'zod'
import { defineFormConfig } from '@/components/Form/util.ts'
import type { FormWorkOrder, WorkOrder } from '@/features/workOrders/types.ts'
import type { InferSchema } from '@/components/Form/types.ts'
import { format } from 'date-fns'
import { optionsOf, stageLabels, statusLabels, valuesOf } from '@/features/workOrders/status.ts'

/* A datetime-local input holds local time, minutes at most: 2026-10-02T09:30 */
const LOCAL_DATE_TIME = "yyyy-MM-dd'T'HH:mm"

const fields = {
  number: {
    label: 'Número',
    schema: z.string().min(2, 'Mínimo 2 caracteres').max(48, 'Máximo 48 caracteres'),
  },
  stage: {
    label: 'Etapa',
    schema: z.enum(valuesOf(stageLabels)),
    options: optionsOf(stageLabels),
  },
  status: {
    label: 'Estado',
    schema: z.enum(valuesOf(statusLabels)),
    options: optionsOf(statusLabels),
  },
  technicianIds: {
    label: 'Técnicos',
    placeholder: 'Añadir técnico',
    schema: z.array(z.object({ value: z.coerce.number().min(0, 'No puede ser menor de 0') })).optional(),      // none while waiting for one
  },
  vehicleId: {
    label: 'Vehículo',
    schema: z.coerce.number().min(0, 'No puede ser menor de 0'),
  },
  labourMinutes: {
    label: 'Minutos',
    schema: z.coerce.number().min(0, 'No puede ser menor de 0'),
  },
  scheduledAt: {
    label: 'Programada',
    schema: z.string().optional(),
    type: 'datetime-local' as const,
  },
}

export const config = defineFormConfig<WorkOrder, FormWorkOrder, typeof fields>({
  fields,
  toFormData: (workOrder: WorkOrder): InferSchema<typeof fields> => {
    const { technicians, vehicle, scheduledAt, ...rest } = workOrder

    return {
      ...rest,
      technicianIds: technicians?.map(({ id }) => ({ value: id })) ?? [],
      vehicleId: vehicle?.id,
      scheduledAt: scheduledAt ? format(new Date(scheduledAt), LOCAL_DATE_TIME) : '',
    }
  },
  toSubmitData: (workOrder: WorkOrder, formData: InferSchema<typeof fields>): FormWorkOrder => {
    const { technicians, ...rest } = workOrder      // the api takes their ids

    return {
      ...rest,
      ...formData,
      technicianIds: formData.technicianIds?.map(({ value }) => value) ?? [],
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
    } as FormWorkOrder
  },
})
