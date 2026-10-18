import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { CARD, INPUT, SECONDARY, SECTION_LABEL } from '@/features/vehicleListings/styles'

const SUGGESTIONS = [
  'Climatizador',
  'Navegador',
  'Cámara trasera',
  'Sensores de aparcamiento',
  'Control de crucero',
  'Bluetooth',
  'Apple CarPlay / Android Auto',
  'Llantas de aleación',
  'Faros LED',
  'Asientos calefactables',
]

type ListingEquipmentProps = {
  equipment: string[]
  onChange: (equipment: string[]) => void
}

const same = (a: string, b: string) => a.localeCompare(b, 'es', { sensitivity: 'base' }) === 0

/* What the vehicle comes with that is worth telling: typed, or one of the usual */
const ListingEquipment = ({ equipment, onChange }: ListingEquipmentProps) => {
  const [ typed, setTyped ] = useState('')

  const add = (name: string) => {
    const trimmed = name.trim()
    if (trimmed && !equipment.some(had => same(had, trimmed)))
      onChange([ ...equipment, trimmed ])
    setTyped('')
  }

  const suggestions = SUGGESTIONS.filter(suggestion => !equipment.some(had => same(had, suggestion)))

  return (
    <section aria-labelledby='listing-equipment' className={ `${CARD} flex flex-col gap-4 p-5` }>
      <h2 id='listing-equipment' className={ SECTION_LABEL }>Equipamiento destacado</h2>

      { equipment.length > 0 &&
        <ul aria-label='Equipamiento' className='flex flex-wrap gap-1.5'>
          { equipment.map(name =>
            <li key={ name } className='flex h-8 items-center gap-1 rounded-full border border-[#D6D3CF] bg-[#F5F5F4] ps-3 pe-1 text-[13px]'>
              { name }
              <button
                type='button'
                aria-label={ `Quitar ${name}` }
                onClick={() => onChange(equipment.filter(had => had !== name))}
                className='grid size-6 cursor-pointer place-content-center rounded-full text-[#78716C] hover:bg-[#E7E5E2]'
              >
                <X className='size-3.5' />
              </button>
            </li>
          )}
        </ul>
      }

      <div className='flex gap-2'>
        <input
          aria-label='Nuevo equipamiento'
          value={ typed }
          placeholder='Añade equipamiento y pulsa Enter'
          onChange={ event => setTyped(event.target.value) }
          onKeyDown={ event => { if (event.key === 'Enter') { event.preventDefault(); add(typed) } } }
          className={ INPUT }
        />
        <button type='button' disabled={ !typed.trim() } onClick={() => add(typed)} className={ `${SECONDARY} shrink-0 disabled:cursor-not-allowed disabled:text-[#A8A29E]` }>
          Añadir
        </button>
      </div>

      { suggestions.length > 0 &&
        <div aria-label='Sugerencias' role='group' className='flex flex-wrap gap-1.5'>
          { suggestions.map(suggestion =>
            <button
              key={ suggestion }
              type='button'
              onClick={() => add(suggestion)}
              className='flex h-8 cursor-pointer items-center gap-1 rounded-full border border-dashed border-[#C9C5C0] px-3 text-[13px] text-[#57534E] hover:border-[#3366E0] hover:text-[#3366E0]'
            >
              <Plus className='size-3.5' /> { suggestion }
            </button>
          )}
        </div>
      }
    </section>
  )
}

export default ListingEquipment
