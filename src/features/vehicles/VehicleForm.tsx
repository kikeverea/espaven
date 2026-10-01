import type { Vehicle } from '@/features/vehicles/types'
import { useVehicleMutations } from '@/features/vehicles/useVehicles'
import { config } from '@/features/vehicles/data/vehicle.form'
import CardForm from '@/components/Form/CardForm'
import type { FormCallbacks } from '@/components/Form/Form'
import type { ComponentProps } from 'react'

type VehicleFormProps = FormCallbacks & ComponentProps<'div'> & {
  name: string
  vehicle: Partial<Vehicle> | null
  className?: string
}

const VehicleForm = ({
  name='vehicle',
  vehicle,
  onCreate,
  onUpdate,
  onCancel,
  className
}: VehicleFormProps) => {

  return (
    <CardForm
      name={ name }
      className={ className }
      itemName={[ 'Vehículo', 'm' ]}
      justify='fluid'
      config={ config }
      item={ vehicle }
      mutations={ useVehicleMutations() }
      onCreate={ onCreate }
      onUpdate={ onUpdate }
      onCancel={ onCancel }
    />
  )
}

export default VehicleForm
