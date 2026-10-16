import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Contact } from '@/features/inquiries/types'
import type { FormVehicle } from '@/features/vehicles/types'
import { phoneOf } from '@/features/clients/useClients'
import { MONO } from '@/features/workOrders/timeline/util/styles'
import ClientSelect from '@/features/vehicles/picker/ClientSelect'
import { parseKilometres } from '@/features/vehicles/picker/util'

type NewVehicleFormProps = {
  saving: boolean
  onCancel: () => void
  onSave: (vehicle: FormVehicle) => void
}

const INPUT = 'h-10 rounded-[8px] border border-[#D6D3CF] bg-white px-3 text-sm outline-none placeholder:text-[#A8A29E] focus:border-[#3366E0] disabled:bg-[#F5F5F4]'

/* a field and, below it and out of its name, what is wrong with it */
const Field = ({ label, error, children, wide }: { label: string, error?: string | false, children: ReactNode, wide?: boolean }) =>
  <div className={ cn('flex flex-col gap-1.5', wide && 'col-span-2') }>
    <label className='flex flex-col gap-1.5'>
      <span className='text-[13px] text-[#57534E]'>{ label }</span>
      { children }
    </label>
    { error && <span className='text-xs text-[#B42318]'>{ error }</span> }
  </div>

/* 'Peugeot 308 1.5 BlueHDi' -> the make, its first word, and the model, the rest */
const splitMakeAndModel = (text: string) => {
  const [ make, ...model ] = text.trim().split(/\s+/)
  return { make, model: model.join(' ') || undefined }
}

const thisYear = new Date().getFullYear()

/* A vehicle new to the workshop, and whose it is */
const NewVehicleForm = ({ saving, onCancel, onSave }: NewVehicleFormProps) => {
  const [ plate, setPlate ] = useState('')
  const [ year, setYear ] = useState('')
  const [ makeAndModel, setMakeAndModel ] = useState('')
  const [ fuel, setFuel ] = useState('')
  const [ kilometres, setKilometres ] = useState('')
  const [ vin, setVin ] = useState('')
  const [ client, setClient ] = useState<Contact | null>(null)

  const yearError = year !== '' && (!/^\d{4}$/.test(year) || Number(year) < 1950 || Number(year) > thisYear + 1) && `Entre 1950 y ${thisYear + 1}`
  const vinError = vin !== '' && vin.length !== 17 && `Tiene 17 caracteres (${vin.length})`
  const ready = !!plate.trim() && !!makeAndModel.trim() && !!client && !yearError && !vinError

  const save = () => onSave({
    plateNumber: plate.trim(),
    year: year ? Number(year) : undefined,
    ...splitMakeAndModel(makeAndModel),
    fuel: fuel.trim() || undefined,
    kilometres: parseKilometres(kilometres),
    vin: vin || undefined,
    clientId: client!.id,
  })

  return (
    <form
      aria-label='Nuevo vehículo'
      onSubmit={ event => { event.preventDefault(); if (ready) save() } }
      className='flex min-h-0 flex-1 flex-col'
    >
      <div className='grid grid-cols-2 gap-x-3 gap-y-3.5 overflow-y-auto px-5 pb-5'>
        <Field label='Matrícula'>
          <input value={ plate } onChange={ event => setPlate(event.target.value.toUpperCase()) } placeholder='0000 XXX' className={ cn(INPUT, MONO, 'tracking-[.06em]') } />
        </Field>
        <Field label='Año' error={ yearError }>
          <input inputMode='numeric' value={ year } onChange={ event => setYear(event.target.value.replace(/\D/g, '').slice(0, 4)) } placeholder={ String(thisYear - 6) } className={ INPUT } />
        </Field>
        <Field label='Marca y modelo' wide>
          <input value={ makeAndModel } onChange={ event => setMakeAndModel(event.target.value) } placeholder='Peugeot 308 1.5 BlueHDi' className={ INPUT } />
        </Field>
        <Field label='Combustible'>
          <input value={ fuel } onChange={ event => setFuel(event.target.value) } placeholder='Diésel' className={ INPUT } />
        </Field>
        <Field label='Kilómetros'>
          <input inputMode='numeric' value={ kilometres } onChange={ event => setKilometres(event.target.value.replace(/[^\d.]/g, '')) } placeholder='0' className={ INPUT } />
        </Field>
        <Field label='Bastidor (VIN)' error={ vinError } wide>
          <input value={ vin } onChange={ event => setVin(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17)) } placeholder='17 CARACTERES' className={ cn(INPUT, MONO, 'tracking-[.04em]') } />
        </Field>
        <div className='flex flex-col gap-1.5'>
          <span className='text-[13px] text-[#57534E]'>Cliente</span>
          <ClientSelect client={ client } onChange={ setClient } className={ INPUT } />
        </div>
        <Field label='Teléfono'>
          <input disabled value={ client ? phoneOf(client) ?? 'Sin teléfono' : '' } placeholder='600 000 000' className={ INPUT } />
        </Field>
      </div>

      <footer className='flex justify-end gap-2 border-t border-[#E3E0DC] px-5 py-3.5'>
        <button type='button' onClick={ onCancel } className='h-9 cursor-pointer rounded-[8px] border border-[#D6D3CF] bg-white px-4 text-sm font-medium hover:bg-[#F5F5F4]'>
          Cancelar
        </button>
        <button
          type='submit'
          disabled={ !ready || saving }
          className='h-9 cursor-pointer rounded-[8px] bg-[#3366E0] px-4 text-sm font-medium text-white hover:bg-[#2A57C4] disabled:cursor-not-allowed disabled:bg-[#E7E5E2] disabled:text-[#A8A29E]'
        >
          { saving ? 'Guardando…' : 'Añadir a la orden' }
        </button>
      </footer>
    </form>
  )
}

export default NewVehicleForm
