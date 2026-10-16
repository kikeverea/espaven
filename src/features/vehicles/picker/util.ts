import type { Vehicle } from '@/features/vehicles/types'

const thousands = new Intl.NumberFormat('es-ES', { useGrouping: true })

/* 58900 -> '58.900', the grouping Spanish leaves out of four figure numbers kept as well */
export const groupDigits = (n: number) => thousands.format(n).replace(/^(\d)(\d{3})$/, '$1.$2')

/* 'Toyota Corolla 1.8 Hybrid' */
export const vehicleName = (vehicle: Pick<Vehicle, 'make' | 'model'>) => [ vehicle.make, vehicle.model ].filter(Boolean).join(' ')

/* What is typed as kilometres, '61.240' or '61240', as a number. Undefined when nothing is */
export const parseKilometres = (text: string): number | undefined => {
  const digits = text.replace(/\D/g, '')
  return digits ? Number(digits) : undefined
}
