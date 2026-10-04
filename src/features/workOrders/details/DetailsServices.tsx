import { Check } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import type { WorkOrder } from '@/features/workOrders/types'
import type { FormService, Service } from '@/features/services/types'
import { useServiceMutations, useWorkOrderServices } from '@/features/services/useServices'
import { workOrderKeys } from '@/features/workOrders/useWorkOrders'
import { duration } from '@/features/workOrders/timeline/func/timeline'
import { MONO } from '@/features/workOrders/timeline/util/styles'

/* What the order is for, ticked off as each is done. A cancelled service is not part of it any more */
const DetailsServices = ({ order }: { order: WorkOrder }) => {
  const client = useQueryClient()
  const { data = [] } = useWorkOrderServices(order.id)
  const { update, status } = useServiceMutations()

  /* the tick shows before the api answers */
  const saving = status.pending.update as (FormService & Pick<Service, 'id'>) | null
  const services = data
    .map(service => service.id === saving?.id ? { ...service, ...saving } as Service : service)
    .filter(service => service.status !== 'cancelled')

  const done = services.filter(service => service.status === 'completed').length
  const total = services.reduce((minutes, service) => minutes + (service.expectedMinutes ?? 0), 0)

  /* the last one done completes the order */
  const toggle = (service: Service) =>
    update(
      { id: service.id, status: service.status === 'completed' ? 'not_started' : 'completed' },
      { onSettled: () => client.invalidateQueries({ queryKey: workOrderKeys.all }) }
    )

  return (
    <section aria-label='Servicios' className='flex flex-col px-5 pt-4 pb-6'>
      <div className='flex items-baseline gap-2'>
        <h3 className='text-sm font-semibold'>Servicios</h3>
        <span className='text-xs text-[#78716C]'>{ done } de { services.length } hechos</span>
      </div>

      { services.length === 0 && <p className='pt-2.5 text-[13px] text-[#78716C]'>Sin servicios.</p> }

      <ul className='mt-1.5'>
        { services.map(service => {
          const checked = service.status === 'completed'

          return (
            <li key={ service.id } className='border-b border-[#F1EFEC]'>
              <button
                type='button'
                role='checkbox'
                aria-checked={ checked }
                onClick={() => toggle(service)}
                className='flex w-full cursor-pointer items-center gap-2.5 py-[9px] text-left'
              >
                <span className={ cn('grid size-[18px] shrink-0 place-content-center rounded-[5px] border-[1.5px]',
                  checked ? 'border-[#1E7A46] bg-[#1E7A46] text-white' : 'border-[#A8A29E] bg-white') }
                >
                  { checked && <Check className='size-[11px]' strokeWidth={ 3.5 } /> }
                </span>
                <span className={ cn('min-w-0 flex-1 text-sm', checked ? 'text-[#78716C]' : 'text-[#1C1917]') }>{ service.name }</span>
                { service.expectedMinutes != null &&
                  <span className={ cn(MONO, 'text-xs text-[#78716C]') }>{ duration(service.expectedMinutes) }</span>
                }
              </button>
            </li>
          )
        })}
      </ul>

      <div className='flex items-center justify-between pt-3'>
        <span className='text-[13px] text-[#57534E]'>Total estimado</span>
        <span className={ `${MONO} text-[13px] font-medium` }>{ duration(total) }</span>
      </div>
    </section>
  )
}

export default DetailsServices
