import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FONT, MONO } from '@/features/workOrders/timeline/util/styles'
import type { ListingStatus, VehicleListing } from '@/features/vehicleListings/types'
import { STATUS_LABELS } from '@/features/vehicleListings/labels'
import { BARLOW } from '@/features/vehicleListings/styles'
import { Cover, PriceTag, StatusBadge } from '@/features/vehicleListings/display'
import { coverOf, specLine } from '@/features/vehicleListings/labels'
import { useVehicleListings } from '@/features/vehicleListings/useVehicleListings'

type Tab = 'all' | ListingStatus

const TABS: [ Tab, string ][] = [ [ 'all', 'Todos' ], ...Object.entries(STATUS_LABELS) as [ ListingStatus, string ][] ]

/* without case or accents: 'citroen' finds 'Citroën' */
const plain = (text?: string | null) => (text ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

/* A listing as a tile: its cover, price and status, what it is, and its plate. The whole tile opens it */
const ListingTile = ({ listing }: { listing: VehicleListing }) =>
  <li>
    <Link
      to='/vehicle_listings/$id'
      params={{ id: String(listing.id) }}
      aria-label={ listing.name }
      className='group flex h-full flex-col overflow-hidden rounded-[12px] border border-[#DCD9D5] bg-white transition-[border-color,box-shadow] hover:border-[#3366E0]/50 hover:shadow-md'
    >
      <div className='relative'>
        <Cover url={ coverOf(listing.photos) } alt={ listing.name } />
        <PriceTag cents={ listing.priceCents } />
        <StatusBadge status={ listing.status } className='absolute top-2.5 left-2.5 shadow-sm' />
      </div>

      <div className='flex flex-1 flex-col gap-1.5 px-4 pt-3.5 pb-4'>
        <h3 className={ cn(BARLOW, 'text-[21px] leading-[1.1] font-bold text-[#1C1917] uppercase') }>{ listing.name }</h3>
        <p className='flex flex-wrap gap-x-2 text-[13px] text-[#78716C]'>
          { specLine(listing).map((part, index, parts) =>
            <span key={ index } className='flex gap-2'>{ part }{ index < parts.length - 1 && <span aria-hidden className='text-[#C9C5C0]'>·</span> }</span>
          )}
        </p>
      </div>

      <footer className='flex items-center gap-2 border-t border-[#E3E0DC] px-4 py-2.5 text-xs text-[#78716C]'>
        { listing.plateNumber && <span className={ cn(MONO, 'font-medium text-[#1C1917]') }>{ listing.plateNumber }</span> }
        { listing.plateNumber && listing.updatedAt && <span aria-hidden>·</span> }
        { listing.updatedAt && <span>{ format(new Date(listing.updatedAt), 'd MMM', { locale: es }) }</span> }
        <span className='flex-1' />
        <span className='font-medium text-[#3366E0] group-hover:underline'>Editar</span>
      </footer>
    </Link>
  </li>

/* The vehicles for sale: searched by name or plate, by status, as tiles */
const VehicleListingsIndex = () => {
  const { data, isLoading } = useVehicleListings()
  const listings = data?.collection ?? []

  const [ search, setSearch ] = useState('')
  const [ tab, setTab ] = useState<Tab>('all')

  /* by name, or by plate with or without its space */
  const query = plain(search.trim())
  const searched = listings.filter(listing =>
    plain(listing.name).includes(query) ||
    plain(listing.plateNumber).replace(/\s/g, '').includes(query.replace(/\s/g, '')))

  const countOf = (tab: Tab) => tab === 'all' ? searched.length : searched.filter(({ status }) => status === tab).length
  const shown = tab === 'all' ? searched : searched.filter(({ status }) => status === tab)
  const published = listings.filter(({ status }) => status === 'published').length

  return (
    <div className={ cn(FONT, 'min-h-full bg-[#E8E6E2] text-[#1C1917]') }>
      <header className='flex min-h-[68px] flex-wrap items-center gap-x-4 gap-y-2 bg-[#3A3532] px-5 py-3.5 text-white'>
        <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
          <h1 className='text-[17px] font-semibold'>Vehículos en venta</h1>
          <p className='text-xs text-white/65'>
            { listings.length } { listings.length === 1 ? 'vehículo' : 'vehículos' } · { published } { published === 1 ? 'publicado' : 'publicados' }
          </p>
        </div>
        <Link
          to='/vehicle_listings/new'
          className='flex h-10 items-center gap-1.5 rounded-[8px] bg-[#3366E0] px-4 text-sm font-medium text-white hover:bg-[#2A57C4]'
        >
          <Plus className='size-4' /> Añadir vehículo
        </Link>
      </header>

      <div className='mx-auto flex max-w-[1280px] flex-col gap-4 p-5'>
        <div className='flex flex-wrap items-center gap-3'>
          <label className='relative min-w-[240px] flex-1'>
            <Search className='pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-[#A8A29E]' />
            <input
              type='search'
              aria-label='Buscar vehículos'
              placeholder='Buscar por marca, modelo o matrícula…'
              value={ search }
              onChange={ event => setSearch(event.target.value) }
              className='h-[42px] w-full rounded-[10px] border border-[#DCD9D5] bg-white ps-10 pe-3 text-sm outline-none placeholder:text-[#A8A29E] focus:border-[#3366E0]'
            />
          </label>

          <div role='tablist' aria-label='Estado' className='flex flex-wrap gap-1 rounded-[10px] border border-[#DCD9D5] bg-white p-1'>
            { TABS.map(([ value, label ]) =>
              <button
                key={ value }
                type='button'
                role='tab'
                aria-selected={ tab === value }
                onClick={() => setTab(value)}
                className={ cn('flex h-8 cursor-pointer items-center gap-1.5 rounded-[7px] px-3 text-[13px] font-medium',
                  tab === value ? 'bg-[#1C1917] text-white' : 'text-[#57534E] hover:bg-[#F5F5F4]') }
              >
                { label }
                <span className={ cn('text-[11px] tabular-nums', tab === value ? 'text-white/70' : 'text-[#A8A29E]') }>{ countOf(value) }</span>
              </button>
            )}
          </div>
        </div>

        { isLoading && <p className='py-16 text-center text-sm text-[#78716C]'>Cargando vehículos…</p> }

        { !isLoading && !shown.length &&
          <p className='py-16 text-center text-sm text-[#78716C]'>
            { listings.length ? 'Ningún vehículo coincide con la búsqueda.' : 'Aún no hay vehículos en venta.' }
          </p>
        }

        <ul aria-label='Vehículos' className='grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4'>
          { shown.map(listing => <ListingTile key={ listing.id } listing={ listing } />) }
        </ul>
      </div>
    </div>
  )
}

export default VehicleListingsIndex
