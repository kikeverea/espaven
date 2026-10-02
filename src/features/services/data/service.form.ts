import * as z from 'zod'
import { defineFormConfig } from '@/components/Form/util'
import type { Service } from '../types'
import type { FieldSetter, InferSchema } from '@/components/Form/types'
import { formatEuros } from '@/lib/numbers'

const standardLaborTime = z.coerce
  .number()
  .min(0, 'No puede ser menor de 0')
  .multipleOf(0.25, 'Debe ser en intervalos de 0,25 h')

export const config = (minuteRate: number) => {

  const fields = {
    name: {
      label: 'Nombre',
      schema: z.string().min(2, 'Mínimo 2 caracteres').max(148, 'Máximo 148 caracteres'),
    },
    standardLaborTime: {
      label: 'Fracción de hora',
      schema: standardLaborTime,
      step: '0.25',
      feedback: (hourFraction: string) => hourFraction
        ? `Precio: ${formatEuros(parseFloat(hourFraction) * 60 * minuteRate)}`
        : null,
      onChange: (hourFraction: string, set: FieldSetter) =>
        set('laborMinutes', hourFraction ? parseFloat(hourFraction) * 60 : '')
    },
    laborMinutes: {
      label: 'Minutos',
      schema: z.coerce.number().min(0, 'No puede ser menor de 0'),
      onChange: (minutes: string, set: FieldSetter) =>
        set('standardLaborTime', minutes ? parseFloat(minutes) / 60 : '')
    },
  }

  return defineFormConfig({
    fields,
    layout: [
      'name',
      [ 'standardLaborTime', 'laborMinutes' ],
    ],
    toFormData: (service: Service): InferSchema<typeof fields> => {
      const { laborMinutes, ...rest } = service

      return {
        ...rest,
        laborMinutes,
        standardLaborTime: laborMinutes / 60
      }
    },
    toSubmitData: (service: Service, formData: InferSchema<typeof fields>) => {

      const { standardLaborTime, ...rest } = formData

      return {
        ...service,
        ...rest,
      }
    }
  })
}
