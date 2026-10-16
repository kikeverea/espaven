import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { MONO } from '@/features/workOrders/timeline/util/styles'

type SlideTrackProps = {
  root: string                                  // what the first pane lists: 'Servicios'
  trail: { label: string, count?: number } | null   // what the second pane shows. Null while the first shows
  onBack: () => void
  action?: ReactNode                            // by the label
  first: ReactNode
  second: ReactNode
}

const LABEL = 'text-[11px] font-medium tracking-[.06em] text-[#78716C] uppercase'

/*
 * Two panes side by side, the second sliding in from the right over the first: a list of
 * categories, then what one of them has. The one out of sight is out of reach too
 */
const SlideTrack = ({ root, trail, onBack, action, first, second }: SlideTrackProps) =>
  <div className='flex min-w-0 flex-col gap-3'>
    <div className='flex h-8 items-center gap-2'>
      { trail
        ? <>
            <button
              type='button'
              aria-label={ `Volver a ${root.toLowerCase()}` }
              onClick={ onBack }
              className='grid size-7 cursor-pointer place-content-center rounded-md text-[#57534E] hover:bg-[#ECEAE6]'
            >
              <ChevronLeft className='size-4' />
            </button>
            <nav aria-label='Ruta' className='flex min-w-0 items-center gap-1.5'>
              <button type='button' onClick={ onBack } className={ `${LABEL} cursor-pointer hover:text-[#1C1917]` }>{ root }</button>
              <span className='text-[#C9C5C0]'>/</span>
              <span className='truncate text-sm font-semibold'>{ trail.label }</span>
              { trail.count != null && <span className={ `${MONO} text-xs text-[#78716C]` }>{ trail.count }</span> }
            </nav>
          </>
        : <span className={ LABEL }>{ root }</span>
      }
      { action }
    </div>

    <div className='overflow-hidden'>
      <div
        className='flex w-[200%] items-start transition-transform duration-[380ms] ease-[cubic-bezier(.2,.8,.2,1)]'
        style={{ transform: trail ? 'translateX(-50%)' : 'none' }}
      >
        <div className='w-1/2 min-w-0' inert={ !!trail } aria-hidden={ !!trail }>{ first }</div>
        <div className='w-1/2 min-w-0' inert={ !trail } aria-hidden={ !trail }>{ second }</div>
      </div>
    </div>
  </div>

export default SlideTrack
