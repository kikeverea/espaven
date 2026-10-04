import type { WorkOrder } from '@/features/workOrders/types.ts'

export type WorkOrderStatus = WorkOrder['status']
export type WorkOrderStage = WorkOrder['stage']

export const statusLabels: Record<WorkOrderStatus, string> = {
  pendingTechnician: 'Sin técnico',
  notStarted: 'Sin empezar',
  inProgress: 'En curso',
  paused: 'En pausa',
  completed: 'Terminada',
  archived: 'Archivada',
}

export const stageLabels: Record<WorkOrderStage, string> = {
  quote: 'Presupuesto',
  order: 'Orden',
  invoice: 'Factura',
}

/* `labels` as a select's options, in their order */
export const optionsOf = <K extends string>(labels: Record<K, string>) =>
  (Object.entries(labels) as [ K, string ][]).map(([ value, label ]) => ({ value, label }))

/* `labels`' keys, as z.enum takes them */
export const valuesOf = <K extends string>(labels: Record<K, string>) =>
  Object.keys(labels) as [ K, ...K[] ]
