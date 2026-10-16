import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { InventoryItem } from '@/features/inventory/inventoryItems/types'
import type { InventoryCategory } from '@/features/inventoryCategories/types'
import { useInventoryCategories } from '@/features/inventoryCategories/useInventoryCategories'
import { useInventoryItems } from '@/features/inventory/inventoryItems/useInventoryItems'
import { MONO } from '@/features/workOrders/timeline/util/styles'
import useDebouncedCallback from '@/components/Table/hooks/useDebouncedCallback'
import SlideTrack from '@/features/services/picker/SlideTrack'
import CategoryTile, { TILE_GRID } from '@/features/services/picker/CategoryTile'
import TickBox from '@/features/services/picker/TickBox'

type InventoryBrowserProps = {
  search: string
  picked: InventoryItem[]
  onToggle: (item: InventoryItem) => void
}

const ItemTile = ({ item, picked, onToggle }: { item: InventoryItem, picked: boolean, onToggle: () => void }) =>
  <button
    type='button'
    role='checkbox'
    aria-checked={ picked }
    aria-label={ item.name }
    onClick={ onToggle }
    className={ cn('flex cursor-pointer items-start gap-3 rounded-[9px] border bg-white p-3 text-left transition-colors',
      picked ? 'border-[#3366E0] bg-[#F3F6FE] shadow-[0_0_0_1px_#3366E0]' : 'border-[#DCD9D5] hover:border-[#C9C5C0]') }
  >
    <TickBox state={ picked ? 'all' : 'none' } />
    <span className='flex min-w-0 flex-col gap-0.5'>
      <span className='text-sm font-medium'>{ item.name }</span>
      { item.sku && <span className={ `${MONO} text-xs text-[#78716C]` }>{ item.sku }</span> }
      { item.stock > 0
        ? <span className='text-xs text-[#57534E]'>{ item.stock } en stock</span>
        : <span className='text-xs font-medium text-[#B45309]'>Sin stock</span>
      }
    </span>
  </button>

const Items = ({ items, isLoading, picked, onToggle }: { items: InventoryItem[], isLoading: boolean } & Omit<InventoryBrowserProps, 'search'>) => {
  if (isLoading) return <p className='py-6 text-center text-sm text-[#78716C]'>Cargando artículos…</p>
  if (!items.length) return <p className='py-6 text-center text-sm text-[#78716C]'>No hay artículos.</p>

  const ids = new Set(picked.map(({ id }) => id))

  return (
    <div className='grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5'>
      { items.map(item => <ItemTile key={ item.id } item={ item } picked={ ids.has(item.id) } onToggle={() => onToggle(item)} />) }
    </div>
  )
}

/*
 * The inventory, for a service being made to use: its categories, then a category's items.
 * A search looks through all of them
 */
const InventoryBrowser = ({ search, picked, onToggle }: InventoryBrowserProps) => {
  const [ category, setCategory ] = useState<InventoryCategory | null>(null)
  const [ term, setTerm ] = useState(search)

  useDebouncedCallback(search.trim(), 300, setTerm)

  const searching = !!term
  const { data: categories, isLoading: loadingCategories } = useInventoryCategories()
  const { data: items, isLoading: loadingItems } = useInventoryItems({
    query: searching
      ? { search: term, perPage: 60 }
      : { perPage: 200, filter: category ? { inventoryCategoryId: { type: 'checkboxes', values: [], checked: [ String(category.id) ] } } : {} },
  })

  const pickedIn = (category: InventoryCategory) => picked.filter(item => item.inventoryCategory?.id === category.id).length
  const shown = searching || category ? items?.collection ?? [] : []

  return (
    <SlideTrack
      root='Inventario'
      trail={ searching ? { label: `Resultados de «${term}»`, count: shown.length } : category && { label: category.name, count: shown.length } }
      onBack={() => setCategory(null)}
      first={
        loadingCategories
          ? <p className='py-6 text-center text-sm text-[#78716C]'>Cargando categorías…</p>
          : <div className={ TILE_GRID }>
              { (categories?.collection ?? []).map(category =>
                <CategoryTile
                  key={ category.id }
                  name={ category.name }
                  icon={ category.icon }
                  detail='Ver artículos'
                  picked={ pickedIn(category) }
                  onOpen={() => setCategory(category)}
                />
              )}
            </div>
      }
      second={ <Items items={ shown } isLoading={ loadingItems } picked={ picked } onToggle={ onToggle } /> }
    />
  )
}

export default InventoryBrowser
