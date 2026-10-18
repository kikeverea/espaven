import { cn } from '@/lib/utils'
import { MONO } from '@/features/workOrders/timeline/util/styles'
import type { EmissionsTag, Fuel, Gearbox } from '@/features/vehicleListings/types'
import { digits, EMISSIONS_TAG_LABELS, FUEL_LABELS, GEARBOX_LABELS, thousands } from '@/features/vehicleListings/labels'
import { CARD, SECTION_LABEL } from '@/features/vehicleListings/styles'
import { itvValue, type ListingDraft } from '@/features/vehicleListings/form/draft'
import { Field, Segmented, TextInput } from '@/features/vehicleListings/form/fields'

type SectionProps = {
  draft: ListingDraft
  onChange: (changes: Partial<ListingDraft>) => void
}

const options = <T extends string>(labels: Record<T, string>) => Object.entries(labels) as [ T, string ][]

/* What the client site heads the listing with: its name, price and plate */
export const ListingAd = ({ draft, onChange }: SectionProps) =>
  <section aria-labelledby='listing-ad' className={ `${CARD} flex flex-col gap-4 p-5` }>
    <h2 id='listing-ad' className={ SECTION_LABEL }>Datos del anuncio</h2>

    <div className='grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]'>
      <Field label='Nombre'>
        <TextInput label='Nombre' value={ draft.name } placeholder='Peugeot 308 1.5 BlueHDi' onChange={ name => onChange({ name }) } />
      </Field>
      <Field label='Precio'>
        <TextInput
          label='Precio'
          inputMode='numeric'
          suffix='€'
          value={ thousands(draft.price) }
          placeholder='12.900'
          onChange={ price => onChange({ price: digits(price) }) }
        />
      </Field>
      <Field label='Matrícula'>
        <TextInput
          label='Matrícula'
          value={ draft.plateNumber }
          placeholder='1234 ABC'
          onChange={ plateNumber => onChange({ plateNumber: plateNumber.toUpperCase() }) }
          className={ cn(MONO, 'uppercase') }
        />
      </Field>
    </div>
  </section>

/* The eight facts the client site lists the vehicle by */
export const ListingSpecs = ({ draft, onChange }: SectionProps) => {
  const itvInvalid = draft.itvUntil.trim() !== '' && !itvValue(draft.itvUntil)

  return (
    <section aria-labelledby='listing-specs' className={ `${CARD} flex flex-col gap-4 p-5` }>
      <h2 id='listing-specs' className={ SECTION_LABEL }>Ficha técnica</h2>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <Field label='Año'>
          <TextInput label='Año' inputMode='numeric' value={ draft.year } placeholder='2019' onChange={ year => onChange({ year: digits(year).slice(0, 4) }) } />
        </Field>
        <Field label='Kilómetros'>
          <TextInput
            label='Kilómetros'
            inputMode='numeric'
            suffix='km'
            value={ thousands(draft.kilometres) }
            placeholder='96.400'
            onChange={ kilometres => onChange({ kilometres: digits(kilometres) }) }
          />
        </Field>
        <Field label='Potencia'>
          <TextInput label='Potencia' inputMode='numeric' suffix='CV' value={ draft.power } placeholder='130' onChange={ power => onChange({ power: digits(power) }) } />
        </Field>
        <Field label='ITV hasta'>
          <TextInput
            label='ITV hasta'
            value={ draft.itvUntil }
            placeholder='MM/AAAA'
            invalid={ itvInvalid }
            onChange={ itvUntil => onChange({ itvUntil: itvUntil.replace(/[^\d/]/g, '').slice(0, 7) }) }
          />
        </Field>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Field label='Combustible' group>
          <Segmented<Fuel> label='Combustible' options={ options(FUEL_LABELS) } value={ draft.fuel } onChange={ fuel => onChange({ fuel }) } />
        </Field>
        <Field label='Cambio' group>
          <Segmented<Gearbox> label='Cambio' options={ options(GEARBOX_LABELS) } value={ draft.gearbox } onChange={ gearbox => onChange({ gearbox }) } />
        </Field>
        <Field label='Puertas' group>
          <Segmented<3 | 5> label='Puertas' options={ [ [ 3, '3' ], [ 5, '5' ] ] } value={ draft.doors } onChange={ doors => onChange({ doors }) } />
        </Field>
        <Field label='Distintivo' group>
          <Segmented<EmissionsTag>
            label='Distintivo'
            options={ options(EMISSIONS_TAG_LABELS) }
            value={ draft.emissionsTag }
            onChange={ emissionsTag => onChange({ emissionsTag }) }
          />
        </Field>
      </div>
    </section>
  )
}
