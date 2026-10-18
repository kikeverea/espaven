import { useEffect, useRef } from 'react'
import { PHOTO_SLOTS, type PhotoSlot } from '@/features/vehicleListings/types'
import { SLOT_LABELS } from '@/features/vehicleListings/labels'
import { CARD, SECTION_LABEL } from '@/features/vehicleListings/styles'
import { viewsFilled, type PhotoEntry } from '@/features/vehicleListings/form/draft'
import PhotoDrop from '@/features/vehicleListings/form/PhotoDrop'

type ListingPhotosProps = {
  photos: PhotoEntry[]
  onChange: (photos: PhotoEntry[]) => void
}

let added = 0

/* One drop per view, then any others. The first view filled, in this order, is the cover */
const ListingPhotos = ({ photos, onChange }: ListingPhotosProps) => {
  /* the files shown are let go of once the form is */
  const urls = useRef<string[]>([])
  useEffect(() => () => urls.current.forEach(url => URL.revokeObjectURL(url)), [])

  const entry = (file: File, slot: PhotoSlot | null): PhotoEntry => {
    const url = URL.createObjectURL(file)
    urls.current.push(url)
    return { key: `added-${++added}`, slot, url, file }
  }

  const of = (slot: PhotoSlot) => photos.find(photo => photo.slot === slot)
  const others = photos.filter(photo => !photo.slot)

  const put = (slot: PhotoSlot, file: File) =>
    onChange([ ...photos.filter(photo => photo.slot !== slot), entry(file, slot) ])

  const remove = (key: string) => onChange(photos.filter(photo => photo.key !== key))

  return (
    <section aria-labelledby='listing-photos' className={ `${CARD} flex flex-col gap-4 p-5` }>
      <header className='flex items-baseline gap-2'>
        <h2 id='listing-photos' className={ SECTION_LABEL }>Fotos</h2>
        <span className='text-xs text-[#A8A29E] tabular-nums'>{ viewsFilled(photos) }/{ PHOTO_SLOTS.length }</span>
        <span className='flex-1' />
        <span className='text-xs text-[#78716C]'>La primera vista con foto es la portada</span>
      </header>

      <div className='grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3'>
        { PHOTO_SLOTS.map(slot => {
          const photo = of(slot)

          return (
            <PhotoDrop
              key={ slot }
              label={ SLOT_LABELS[slot] }
              url={ photo?.url }
              onFiles={ ([ file ]) => put(slot, file) }
              onRemove={ photo && (() => remove(photo.key)) }
            />
          )
        })}
      </div>

      <div className='flex flex-col gap-2.5'>
        <h3 className='text-[13px] font-medium'>
          Otras fotos { others.length > 0 && <span className='text-[#A8A29E] tabular-nums'>{ others.length }</span> }
        </h3>
        <div className='grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2.5'>
          { others.map((photo, index) =>
            <PhotoDrop
              key={ photo.key }
              label={ `Otra ${index + 1}` }
              url={ photo.url }
              onFiles={ ([ file ]) => onChange(photos.map(other => other.key === photo.key ? entry(file, null) : other)) }
              onRemove={() => remove(photo.key)}
            />
          )}
          <PhotoDrop label='Otras fotos' multiple onFiles={ files => onChange([ ...photos, ...files.map(file => entry(file, null)) ]) }>
            Añadir
          </PhotoDrop>
        </div>
      </div>
    </section>
  )
}

export default ListingPhotos
