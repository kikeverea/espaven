import * as z from 'zod'
import { defineFormConfig } from '@/components/Form/util.ts'
import type { FormVehicle, Vehicle } from '@/features/vehicles/types.ts'
import type { InferSchema } from '@/components/Form/types.ts'

const fields = {
  clientId: {
    label: 'Cliente',
    schema: z.coerce.number().min(0, 'No puede ser menor de 0'),
  },
  plateNumber: {
    label: 'Matrícula',
    schema: z.string().max(48, 'Máximo 48 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
  },
  description: {
    label: 'Descripción',
    schema: z.string().max(500, 'Máximo 500 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
    variation: 'textarea' as const,
  },
  make: {
    label: 'Marca',
    schema: z.string().max(48, 'Máximo 48 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
  },
  makeDescription: {
    label: 'Descripción de la marca',
    schema: z.string().max(500, 'Máximo 500 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
    variation: 'textarea' as const,
  },
  model: {
    label: 'Modelo',
    schema: z.string().max(48, 'Máximo 48 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
  },
  modelDescription: {
    label: 'Descripción del modelo',
    schema: z.string().max(500, 'Máximo 500 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
    variation: 'textarea' as const,
  },
  engineSize: {
    label: 'Cilindrada',
    schema: z.string().max(48, 'Máximo 48 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
  },
  registrationDate: {
    label: 'Fecha de matriculación',
    schema: z.date().optional(),
  },
  variation: {
    label: 'Variación',
    schema: z.string().max(48, 'Máximo 48 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
  },
  variantType: {
    label: 'Tipo de variante',
    schema: z.string().max(48, 'Máximo 48 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
  },
  vehicleType: {
    label: 'Tipo de vehículo',
    schema: z.string().max(48, 'Máximo 48 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
  },
  seats: {
    label: 'Plazas',
    schema: z.coerce.number().min(0, 'No puede ser menor de 0').optional(),
  },
  fuel: {
    label: 'Combustible',
    schema: z.string().max(48, 'Máximo 48 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
  },
  doors: {
    label: 'Puertas',
    schema: z.coerce.number().min(0, 'No puede ser menor de 0').optional(),
  },
  dynamicPower: {
    label: 'Potencia',
    schema: z.coerce.number().min(0, 'No puede ser menor de 0').optional(),
  },
  kType: {
    label: 'K-Type',
    schema: z.string().max(48, 'Máximo 48 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
  },
  indicativePrice: {
    label: 'Precio orientativo',
    schema: z.coerce.number().min(0, 'No puede ser menor de 0').optional(),
  },
  allTerrain: {
    label: 'Todoterreno',
    schema: z.boolean().optional(),
  },
  stolen: {
    label: 'Robado',
    schema: z.string().max(48, 'Máximo 48 caracteres').refine(value => value === '' || value.length >= 2, 'Mínimo 2 caracteres').optional(),
  },
}

export const config = defineFormConfig<Vehicle, FormVehicle, typeof fields>({
  fields,
  defaultValues: { allTerrain: false },
  /* the form holds the ids of the records the vehicle references, and Dates for its date strings */
  toFormData: (vehicle: Vehicle): InferSchema<typeof fields> => {
    const { client, registrationDate, ...rest } = vehicle

    return {
      ...rest,
      clientId: client?.id,
      registrationDate: registrationDate ? new Date(registrationDate) : undefined,
    }
  },
})
