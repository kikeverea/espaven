import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Trash2, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FONT, MONO } from '@/features/workOrders/timeline/util/styles'
import type { ListingStatus, VehicleListing } from '@/features/vehicleListings/types'
import { STATUS_LABELS } from '@/features/vehicleListings/labels'
import { CARD, PRIMARY, SECONDARY, SECTION_LABEL } from '@/features/vehicleListings/styles'
import { useVehicleListing, useVehicleListingMutations } from '@/features/vehicleListings/useVehicleListings'
import { draftOf, toWrite, type ListingDraft } from '@/features/vehicleListings/form/draft'
import ListingPhotos from '@/features/vehicleListings/form/ListingPhotos'
import { ListingAd, ListingSpecs } from '@/features/vehicleListings/form/ListingSpecs'
import ListingEquipment from '@/features/vehicleListings/form/ListingEquipment'
import ListingPreview from '@/features/vehicleListings/form/ListingPreview'

const STATUSES = Object.entries(STATUS_LABELS) as [ ListingStatus, string ][]

/* How the client site tells the vehicle: a blank line starts a paragraph */
const ListingDescription = ({ value, onChange }: { value: string, onChange: (value: string) => void }) =>
  <section aria-labelledby='listing-description' className={ `${CARD} flex flex-col gap-3 p-5` }>
    <header className='flex items-baseline gap-2'>
      <h2 id='listing-description' className={ SECTION_LABEL }>Descripción</h2>
      <span className='flex-1' />
      <span className='text-xs text-[#A8A29E] tabular-nums'>{ value.length } caracteres</span>
    </header>
    <textarea
      aria-label='Descripción'
      value={ value }
      rows={ 7 }
      placeholder='Estado, revisiones hechas, garantía… Deja una línea en blanco para empezar otro párrafo.'
      onChange={ event => onChange(event.target.value) }
      className='w-full resize-y rounded-[8px] border border-[#D6D3CF] bg-white px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-[#A8A29E] focus:border-[#3366E0]'
    />
  </section>

/* Asks before a listing goes for good */
const DeleteDialog = ({ open, name, onOpenChange, onConfirm }: { open: boolean, name: string, onOpenChange: (open: boolean) => void, onConfirm: () => void }) =>
  <AlertDialog open={ open } onOpenChange={ onOpenChange }>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogMedia className='bg-red-100 text-red-700'>
          <TriangleAlert />
        </AlertDialogMedia>
        <AlertDialogTitle>¿Eliminar el vehículo?</AlertDialogTitle>
        <AlertDialogDescription>{ name || 'El anuncio' } dejará de estar en venta y se borrarán sus fotos. No se puede deshacer.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction variant='destructiveSolid' onClick={ onConfirm }>Eliminar</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

/* The form, once the listing it edits is there */
const ListingEditor = ({ listing }: { listing: VehicleListing | null }) => {
  const navigate = useNavigate()
  const { create, update, remove, status } = useVehicleListingMutations()

  const [ draft, setDraft ] = useState<ListingDraft>(() => draftOf(listing))
  const [ deleting, setDeleting ] = useState(false)

  const change = (changes: Partial<ListingDraft>) => setDraft(current => ({ ...current, ...changes }))

  const saving = !!(listing ? status.pending.update : status.pending.create)
  const back = () => navigate({ to: '/vehicle_listings' })

  const done = (title: string) => () => {
    toast.add({ title, type: 'success' })
    back()
  }

  const save = () => listing
    ? update({ id: listing.id, ...toWrite(draft, listing) }, { onSuccess: done('Vehículo guardado') })
    : create(toWrite(draft), { onSuccess: done('Vehículo añadido') })

  const about = [ draft.name.trim(), draft.plateNumber.trim() ].filter(Boolean)

  return (
    <div className={ cn(FONT, 'flex min-h-full flex-col bg-[#E8E6E2] text-[#1C1917]') }>
      <header className='flex min-h-[68px] flex-col justify-center gap-1 bg-[#3A3532] px-5 py-3.5 text-white'>
        <h1 className='text-[17px] font-semibold'>{ listing ? 'Editar vehículo' : 'Nuevo vehículo' }</h1>
        { about.length > 0 &&
          <p className='flex flex-wrap gap-x-2.5 text-xs text-white/65'>
            <span>{ about[0] }</span>
            { about[1] && <><span aria-hidden>·</span><span className={ MONO }>{ about[1] }</span></> }
          </p>
        }
      </header>

      <div className='mx-auto grid w-full max-w-[1280px] flex-1 items-start gap-4 p-5 min-[1100px]:grid-cols-[minmax(0,1fr)_360px]'>
        <div className='flex min-w-0 flex-col gap-4'>
          <ListingPhotos photos={ draft.photos } onChange={ photos => change({ photos }) } />
          <ListingAd draft={ draft } onChange={ change } />
          <ListingSpecs draft={ draft } onChange={ change } />
          <ListingEquipment equipment={ draft.equipment } onChange={ equipment => change({ equipment }) } />
          <ListingDescription value={ draft.description } onChange={ description => change({ description }) } />
        </div>

        <div className='min-[1100px]:sticky min-[1100px]:top-5'>
          <ListingPreview draft={ draft } />
        </div>
      </div>

      <footer className='sticky bottom-0 z-10 border-t border-[#DCD9D5] bg-[#FBFAF9]/95 backdrop-blur'>
        <div className='mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 px-5 py-3'>
          <div role='radiogroup' aria-label='Estado' className='flex rounded-[9px] border border-[#DCD9D5] bg-white p-0.5'>
            { STATUSES.map(([ value, label ]) =>
              <button
                key={ value }
                type='button'
                role='radio'
                aria-checked={ draft.status === value }
                onClick={() => change({ status: value })}
                className={ cn('h-8 cursor-pointer rounded-[7px] px-3 text-[13px] font-medium',
                  draft.status === value ? 'bg-[#1C1917] text-white' : 'text-[#57534E] hover:bg-[#F5F5F4]') }
              >
                { label }
              </button>
            )}
          </div>

          { listing &&
            <button type='button' onClick={() => setDeleting(true)} className='flex h-10 cursor-pointer items-center gap-1.5 rounded-[8px] px-3 text-sm font-medium text-[#B42318] hover:bg-[#FEF3F2]'>
              <Trash2 className='size-4' /> Eliminar
            </button>
          }

          <span className='flex-1' />

          <button type='button' onClick={ back } className={ SECONDARY }>Volver</button>
          <button type='button' onClick={ save } disabled={ !draft.name.trim() || saving } className={ PRIMARY }>
            { saving ? 'Guardando…' : 'Guardar' }
          </button>
        </div>
      </footer>

      { listing &&
        <DeleteDialog
          open={ deleting }
          name={ listing.name }
          onOpenChange={ setDeleting }
          onConfirm={() => remove(listing, { onSuccess: done('Vehículo eliminado') })}
        />
      }
    </div>
  )
}

/* A vehicle for sale, new without an id: its photos, what the client site says of it, and its status */
const VehicleListingForm = ({ id }: { id?: VehicleListing['id'] }) => {
  const { data: listing, isLoading, isError } = useVehicleListing(id)

  if (id != null && !listing)
    return (
      <div className={ cn(FONT, 'grid min-h-full place-content-center bg-[#E8E6E2] text-sm text-[#78716C]') }>
        { isLoading ? 'Cargando vehículo…' : isError ? 'No se ha podido cargar el vehículo.' : null }
      </div>
    )

  return <ListingEditor key={ listing?.id ?? 'new' } listing={ listing ?? null } />
}

export default VehicleListingForm
