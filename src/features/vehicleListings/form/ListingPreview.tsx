import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BARLOW, CARD, SECTION_LABEL } from '@/features/vehicleListings/styles'
import { Cover, PriceTag } from '@/features/vehicleListings/display'
import { coverOf, specLine } from '@/features/vehicleListings/labels'
import { checklist, type ListingDraft } from '@/features/vehicleListings/form/draft'

/* The draft the way the client site's card will show it, and what it still lacks */
const ListingPreview = ({ draft }: { draft: ListingDraft }) => {
  const checks = checklist(draft)
  const done = checks.filter(check => check.done).length

  const spec = specLine({
    year: draft.year ? Number(draft.year) : null,
    kilometres: draft.kilometres ? Number(draft.kilometres) : null,
    fuel: draft.fuel,
    gearbox: draft.gearbox,
  })

  return (
    <section aria-labelledby='listing-preview' className={ `${CARD} flex flex-col gap-4 p-5` }>
      <h2 id='listing-preview' className={ SECTION_LABEL }>Vista previa · web</h2>

      <div className='rounded-[10px] bg-[#0B0B0C] p-4'>
        <article aria-label='Tarjeta en la web' className='flex flex-col border border-white/12 bg-[#0E0E10] text-[#F4F1EA]'>
          <div className='relative'>
            <Cover url={ coverOf(draft.photos) } alt={ draft.name || 'Portada' } dark />
            <PriceTag cents={ draft.price ? Number(draft.price) * 100 : null } />
          </div>
          <div className='flex flex-col gap-2.5 px-[18px] pt-[18px] pb-5'>
            <h3 className={ cn(BARLOW, 'text-[22px] leading-[1.1] font-semibold uppercase', !draft.name && 'text-[#6E6A65]') }>
              { draft.name || 'Nombre del vehículo' }
            </h3>
            { spec.length > 0 &&
              <p className='flex flex-wrap gap-x-3.5 gap-y-1.5 text-sm text-[#A4A09A]'>
                { spec.map((part, index) =>
                  <span key={ index } className='flex gap-3.5'>{ part }{ index < spec.length - 1 && <span aria-hidden className='text-[#3A3A3C]'>·</span> }</span>
                )}
              </p>
            }
            <span className={ cn(BARLOW, 'mt-1 text-sm font-semibold tracking-[.14em] text-[#E9B62E] uppercase') }>Ver detalles →</span>
          </div>
        </article>
      </div>

      <div className='flex flex-col gap-2'>
        <p className='text-[13px] font-medium'>
          Para publicar <span className='text-[#78716C] tabular-nums'>{ done } de { checks.length }</span>
        </p>
        <ul aria-label='Lista de comprobación' className='flex flex-col gap-1.5'>
          { checks.map(({ label, done }) =>
            <li key={ label } className='flex items-center gap-2 text-[13px]'>
              { done
                ? <span className='grid size-[18px] place-content-center rounded-full bg-[#3FA864] text-white'><Check className='size-3' strokeWidth={ 3 } /></span>
                : <Circle className='size-[18px] text-[#D6D3CF]' /> }
              <span className={ done ? 'text-[#1C1917]' : 'text-[#78716C]' }>
                <span className='sr-only'>{ done ? 'Hecho: ' : 'Pendiente: ' }</span>{ label }
              </span>
            </li>
          )}
        </ul>
      </div>
    </section>
  )
}

export default ListingPreview
