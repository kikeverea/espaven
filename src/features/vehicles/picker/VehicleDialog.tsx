import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Vehicle } from '@/features/vehicles/types'
import { useVehicleMutations } from '@/features/vehicles/useVehicles'
import { FONT } from '@/features/workOrders/timeline/util/styles'
import VehicleSearch from '@/features/vehicles/picker/VehicleSearch'
import NewVehicleForm from '@/features/vehicles/picker/NewVehicleForm'

type VehicleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  current: Vehicle | null
  onPick: (vehicle: Vehicle) => void
}

type Tab = 'search' | 'new'

const TABS: [ Tab, string ][] = [ [ 'search', 'Buscar existente' ], [ 'new', 'Nuevo vehículo' ] ]

/* Picks the order's vehicle: one the workshop has, found, or a new one, created then and there */
const VehicleDialog = ({ open, onOpenChange, current, onPick }: VehicleDialogProps) => {
  const [ tab, setTab ] = useState<Tab>('search')
  const { create, status } = useVehicleMutations()

  const pick = (vehicle: Vehicle) => {
    onPick(vehicle)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={ open } onOpenChange={ open => { onOpenChange(open); if (!open) setTab('search') } }>
      <Dialog.Portal>
        <Dialog.Backdrop className='fixed inset-0 z-50 bg-[#1C1917]/30 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0' />
        <Dialog.Popup
          className={ cn(FONT, `fixed top-1/2 left-1/2 z-50 flex max-h-[min(640px,calc(100vh-32px))] w-[min(560px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2
            flex-col rounded-[14px] bg-[#FBFAF9] text-[#1C1917] shadow-2xl outline-none transition-[opacity,scale]
            data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0`) }
        >
          <div className='flex items-center justify-between px-5 pt-4 pb-3'>
            <Dialog.Title className='text-lg font-semibold'>{ current ? 'Cambiar vehículo' : 'Seleccionar vehículo' }</Dialog.Title>
            <Dialog.Close aria-label='Cerrar' className='grid size-8 cursor-pointer place-content-center rounded-md text-[#57534E] hover:bg-[#F1EFEC]'>
              <X className='size-4' />
            </Dialog.Close>
          </div>

          <div role='tablist' className='mx-5 mb-4 inline-flex self-start rounded-[10px] bg-[#ECEAE6] p-1'>
            { TABS.map(([ value, label ]) =>
              <button
                key={ value }
                type='button'
                role='tab'
                aria-selected={ tab === value }
                onClick={() => setTab(value)}
                className={ cn('h-8 cursor-pointer rounded-[7px] px-3.5 text-sm font-medium transition-colors',
                  tab === value ? 'bg-white shadow-sm' : 'text-[#57534E] hover:text-[#1C1917]') }
              >
                { label }
              </button>
            )}
          </div>

          { tab === 'search'
            ? <VehicleSearch current={ current } onPick={ pick } />
            : <NewVehicleForm
                saving={ !!status.pending.create }
                onCancel={() => onOpenChange(false)}
                onSave={ vehicle => create(vehicle, { onSuccess: pick }) }
              />
          }
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default VehicleDialog
