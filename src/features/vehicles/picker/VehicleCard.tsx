import { Fragment, useEffect, useState } from 'react'
import { Car, ChevronDown } from 'lucide-react'
import type { Vehicle } from '@/features/vehicles/types'
import { fullName } from '@/features/clients/useClients'
import { MONO } from '@/features/workOrders/timeline/util/styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import PlateBadge from '@/features/vehicles/picker/PlateBadge'
import { groupDigits, parseKilometres, vehicleName } from '@/features/vehicles/picker/util'

type VehicleCardProps = {
  vehicle: Vehicle | null
  entryKilometres?: number
  onEntryKilometres: (kilometres: number | undefined) => void
  onChange: () => void                  // to pick another, or the first
}

const CARD = 'flex min-h-[128px] flex-col justify-between gap-3 rounded-[12px] border p-4'
const LABEL = 'text-xs text-[#78716C]'
const BUTTON = 'flex h-8 cursor-pointer items-center gap-1.5 rounded-[7px] border border-[#D6D3CF] bg-white px-3 text-[13px] font-medium hover:bg-[#F5F5F4]'

/* Its record, for a look at what the card leaves out */
const Specs = ({ vehicle }: { vehicle: Vehicle }) => {
  const specs = [
    [ 'Bastidor', vehicle.vin ],
    [ 'Combustible', vehicle.fuel ],
    [ 'Cilindrada', vehicle.engineSize ],
    [ 'Potencia', vehicle.dynamicPower && `${vehicle.dynamicPower} CV` ],
    [ 'Puertas', vehicle.doors ],
    [ 'Plazas', vehicle.seats ],
    [ 'Matriculación', vehicle.registrationDate && new Date(vehicle.registrationDate).toLocaleDateString('es-ES') ],
  ].filter(([ , value ]) => value)

  return (
    <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]'>
      { specs.map(([ label, value ]) =>
        <div key={ label } className='contents'>
          <dt className='text-[#78716C]'>{ label }</dt>
          <dd className={ label === 'Bastidor' ? MONO : '' }>{ value }</dd>
        </div>
      )}
      { !specs.length && <dd className='col-span-2 text-[#78716C]'>Sin datos técnicos.</dd> }
    </dl>
  )
}

/* The kilometres it comes in with, grouped as they are typed: 61.240 */
const EntryKilometres = ({ value, onChange }: { value?: number, onChange: (kilometres: number | undefined) => void }) => {
  const [ text, setText ] = useState(value != null ? groupDigits(value) : '')

  useEffect(() => { setText(value != null ? groupDigits(value) : '') }, [ value ])

  return (
    <label className='flex flex-col gap-1'>
      <span className={ LABEL }>KM entrada</span>
      <span className='flex h-9 items-center gap-1.5 rounded-[8px] border border-[#D6D3CF] bg-white px-2.5 focus-within:border-[#3366E0]'>
        <input
          aria-label='Kilómetros de entrada'
          inputMode='numeric'
          value={ text }
          placeholder='0'
          onChange={ event => {
            const kilometres = parseKilometres(event.target.value)
            setText(kilometres != null ? groupDigits(kilometres) : '')
            onChange(kilometres)
          }}
          className={ `${MONO} w-[88px] bg-transparent text-right text-[15px] outline-none` }
        />
        <span className='text-xs text-[#78716C]'>km</span>
      </span>
    </label>
  )
}

/*
 * The vehicle an order is for: its plate, what it is and whose, and the kilometres it comes in
 * with. Without one, a grey card the same size that asks for it
 */
const VehicleCard = ({ vehicle, entryKilometres, onEntryKilometres, onChange }: VehicleCardProps) => {
  if (!vehicle)
    return (
      <button
        type='button'
        onClick={ onChange }
        className={ `${CARD} cursor-pointer items-center justify-center border-dashed border-[#C9C5C0] bg-[#F1EFEC] text-[#78716C] hover:bg-[#ECEAE6]` }
      >
        <span className='flex items-center gap-2 text-sm'>
          <Car aria-hidden className='size-4' /> No has seleccionado un vehículo
        </span>
        <span className={ `${BUTTON} text-[#1C1917]` }>Seleccionar vehículo</span>
      </button>
    )

  const meta = [ vehicle.year, vehicle.fuel, vehicle.kilometres != null && `${groupDigits(vehicle.kilometres)} km (últ. visita)` ]
    .filter(Boolean)

  return (
    <section aria-label='Vehículo' className={ `${CARD} border-[#DCD9D5] bg-white` }>
      <div className='flex flex-wrap items-start gap-x-6 gap-y-3'>
        <div className='flex min-w-0 flex-1 items-center gap-3.5'>
          <PlateBadge plate={ vehicle.plateNumber } />
          <div className='flex min-w-0 flex-col'>
            <span className='truncate text-[15px] font-semibold'>{ vehicleName(vehicle) || 'Vehículo sin modelo' }</span>
            { meta.length > 0 &&
              <span className='truncate text-[13px] text-[#78716C]'>
                { meta.map((part, index) =>
                  <Fragment key={ index }>{ index > 0 && <span aria-hidden className='mx-1.5'> · </span> }{ part }</Fragment>
                )}
              </span>
            }
          </div>
        </div>

        <div className='flex items-end gap-4'>
          { vehicle.client &&
            <div className='flex flex-col gap-1 pb-2'>
              <span className={ LABEL }>Cliente</span>
              <span className='text-sm font-semibold'>{ fullName(vehicle.client) }</span>
            </div>
          }
          <EntryKilometres value={ entryKilometres } onChange={ onEntryKilometres } />
        </div>
      </div>

      <div className='flex gap-2'>
        <Popover>
          <PopoverTrigger className={ BUTTON }>
            Ficha <ChevronDown className='size-3.5' />
          </PopoverTrigger>
          <PopoverContent align='start' className='w-80 p-3.5'>
            <Specs vehicle={ vehicle } />
          </PopoverContent>
        </Popover>
        <button type='button' onClick={ onChange } className={ BUTTON }>Cambiar</button>
      </div>
    </section>
  )
}

export default VehicleCard
