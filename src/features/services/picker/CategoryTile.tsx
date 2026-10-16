import { ChevronRight } from 'lucide-react'
import { MONO } from '@/features/workOrders/timeline/util/styles'
import CategoryIcon from '@/features/services/picker/CategoryIcon'

type CategoryTileProps = {
  name: string
  icon?: string
  detail: string                  // what it has: '5 servicios'
  picked: number                  // how many of them are picked, on a badge while any
  onOpen: () => void
}

export const TILE_GRID = 'grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3'

const CategoryTile = ({ name, icon, detail, picked, onOpen }: CategoryTileProps) =>
  <button
    type='button'
    onClick={ onOpen }
    className='relative flex cursor-pointer items-center gap-3 rounded-[10px] border border-[#DCD9D5] bg-white p-3.5 text-left transition-colors hover:border-[#C9C5C0] hover:bg-[#FAFAF9]'
  >
    <span className='grid size-10 shrink-0 place-content-center rounded-[9px] bg-[#F1EFEC] text-[#57534E]'>
      <CategoryIcon icon={ icon } className='size-5' />
    </span>
    <span className='flex min-w-0 flex-1 flex-col'>
      <span className='truncate text-sm font-semibold'>{ name }</span>
      <span className='text-xs text-[#78716C]'>{ detail }</span>
    </span>
    <ChevronRight aria-hidden className='size-4 shrink-0 text-[#A8A29E]' />
    { picked > 0 &&
      <span
        aria-label={ `${picked} elegidos` }
        className={ `${MONO} absolute top-2 right-8 grid h-5 min-w-5 place-content-center rounded-full bg-[#3366E0] px-1.5 text-[11px] font-semibold text-white` }
      >
        { picked }
      </span>
    }
  </button>

export default CategoryTile
