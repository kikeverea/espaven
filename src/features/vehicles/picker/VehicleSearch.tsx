import { useState } from 'react'
import { Search } from 'lucide-react'
import { startOfYesterday } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Vehicle } from '@/features/vehicles/types'
import { useVehicles } from '@/features/vehicles/useVehicles'
import { fullName } from '@/features/clients/useClients'
import useDebouncedCallback from '@/components/Table/hooks/useDebouncedCallback'
import PlateBadge from '@/features/vehicles/picker/PlateBadge'
import { groupDigits, vehicleName } from '@/features/vehicles/picker/util'

type VehicleSearchProps = {
  current: Vehicle | null
  onPick: (vehicle: Vehicle) => void
}

const Row = ({ vehicle, current, onPick }: { vehicle: Vehicle, current: boolean, onPick: () => void }) =>
  <li>
    <button
      type='button'
      onClick={ onPick }
      className={ cn('flex w-full cursor-pointer items-center gap-3.5 rounded-[10px] border px-3.5 py-3 text-left transition-colors',
        current ? 'border-[#3366E0] bg-[#F3F6FE]' : 'border-[#DCD9D5] bg-white hover:border-[#C9C5C0] hover:bg-[#FAFAF9]') }
    >
      <PlateBadge plate={ vehicle.plateNumber } size='sm' />
      <span className='flex min-w-0 flex-1 flex-col'>
        <span className='truncate text-sm font-medium'>{ [ vehicleName(vehicle), vehicle.year ].filter(Boolean).join(' · ') }</span>
        <span className='truncate text-xs text-[#78716C]'>
          { [ vehicle.client && fullName(vehicle.client), vehicle.kilometres != null && `${groupDigits(vehicle.kilometres)} km` ].filter(Boolean).join(' · ') }
        </span>
      </span>
      { current && <span className='rounded-[6px] bg-[#EEF3FD] px-2 py-0.5 text-xs font-medium text-[#3366E0]'>Actual</span> }
    </button>
  </li>

/*
 * The vehicles to pick from: those created today or yesterday, the ones likely to be coming in,
 * or those a search finds by plate, model, client or bastidor
 */
const VehicleSearch = ({ current, onPick }: VehicleSearchProps) => {
  const [ text, setText ] = useState('')
  const [ search, setSearch ] = useState('')
  const [ since ] = useState(() => startOfYesterday().toISOString())

  useDebouncedCallback(text.trim(), 300, setSearch)

  const { data, isLoading } = useVehicles(search
    ? { search, perPage: 20 }
    : { perPage: 20, sort: { column: 'createdAt', direction: 'desc' }, filter: { createdAt: { type: 'range', min: since } } })

  const vehicles = data?.collection ?? []

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3 px-5 pb-5'>
      <div className='relative'>
        <Search aria-hidden className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#A8A29E]' />
        <input
          type='search'
          autoFocus
          aria-label='Buscar vehículos'
          placeholder='Matrícula, modelo, cliente o bastidor…'
          value={ text }
          onChange={ event => setText(event.target.value) }
          className='h-11 w-full rounded-[9px] border border-[#D6D3CF] bg-white ps-9 pe-3 text-sm outline-none focus:border-[#3366E0]'
        />
      </div>

      { !search && <span className='text-[11px] font-medium tracking-[.06em] text-[#78716C] uppercase'>Creados hoy o ayer</span> }

      { isLoading
        ? <p className='py-6 text-center text-sm text-[#78716C]'>Buscando vehículos…</p>
        : !vehicles.length
          ? <p className='py-6 text-center text-sm text-[#78716C]'>
              { search ? 'Ningún vehículo coincide con la búsqueda.' : 'No se ha creado ningún vehículo hoy ni ayer. Búscalo arriba o créalo.' }
            </p>
          : <ul aria-label='Vehículos' className='flex min-h-0 flex-col gap-2 overflow-y-auto'>
              { vehicles.map(vehicle =>
                <Row key={ vehicle.id } vehicle={ vehicle } current={ vehicle.id === current?.id } onPick={() => onPick(vehicle)} />
              )}
            </ul>
      }
    </div>
  )
}

export default VehicleSearch
