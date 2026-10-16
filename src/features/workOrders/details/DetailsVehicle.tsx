import type { WorkOrder } from '@/features/workOrders/types'
import { MONO } from '@/features/workOrders/timeline/util/styles'

/* The vehicle the order is for, and whose it is */
const DetailsVehicle = ({ order }: { order: WorkOrder }) => {
  const { vehicle } = order
  const name = vehicle && [ vehicle.make, vehicle.model ].filter(Boolean).join(' ')
  const owner = vehicle?.client && [ vehicle.client.name, vehicle.client.lastName ].filter(Boolean).join(' ')

  return (
    <section aria-label='Vehículo' className='flex flex-col gap-2.5 border-b border-[#E3E0DC] px-5 py-4'>
      <h3 className='text-sm font-semibold'>Vehículo</h3>

      { !vehicle
        ? <p className='text-[13px] text-[#78716C]'>Sin vehículo.</p>
        : <div className='flex items-center gap-2.5'>
            { vehicle.plateNumber &&
              <span className={ `${MONO} rounded-md border border-[#D6D3CF] px-2 py-1 text-xs font-medium` }>
                { vehicle.plateNumber }
              </span>
            }
            <div className='flex min-w-0 flex-1 flex-col'>
              { name && <span className='truncate text-sm font-medium'>{ name }</span> }
              { owner && <span className='truncate text-xs text-[#78716C]'>{ owner }</span> }
            </div>
          </div>
      }
    </section>
  )
}

export default DetailsVehicle
