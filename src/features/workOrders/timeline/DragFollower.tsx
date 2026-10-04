import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils.ts'
import { FONT, MONO } from '@/features/workOrders/timeline/util/styles.ts'
import type { Drag, Ghost } from '@/features/workOrders/timeline/util/types'
import useDrag from '@/features/workOrders/timeline/hooks/useDrag'

/*
 * What follows the pointer during a drag, in place of the browser's image of the card. Over the
 * timeline, only a ring around the pointer, so nothing covers the slot it shows; anywhere else,
 * a copy of the card, held where it was grabbed
 */
const DragFollower = () => {
  const { drag, ghost } = useDrag()
  return drag && <Follower drag={ drag } placing={ ghost } />
}

/* Mounted with each drag, so it starts where the drag did */
const Follower = ({ drag, placing }: { drag: Drag, placing: Ghost | null }) => {
  const pointer = usePointer(drag.pointer)

  return createPortal(
    placing
      ? <span
          aria-hidden='true'
          data-drag-follower='ring'
          className={ cn('pointer-events-none fixed z-[60] size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2',
            placing.conflict ? 'border-red-500 bg-red-500/15' : 'border-blue-600 bg-blue-600/15') }
          style={{ left: pointer.x, top: pointer.y }}
        />
      : <div
          aria-hidden='true'
          data-drag-follower='card'
          className={ cn(FONT, 'pointer-events-none fixed z-[60] flex -rotate-1 flex-col justify-center gap-0.5 overflow-hidden rounded-[9px] border border-stone-300 bg-white/95 px-3 shadow-lg') }
          style={{
            left: pointer.x - drag.grab.x,
            top: pointer.y - drag.grab.y,
            width: drag.size.width,
            height: drag.size.height,
          }}
        >
          <span className='truncate text-sm font-medium text-stone-900'>{ drag.order.name }</span>
          <span className={ cn(MONO, 'truncate text-[11px] text-stone-500') }>{ drag.order.number }</span>
        </div>,
    document.body
  )
}

const usePointer = (start: { x: number, y: number }) => {
  const [ pointer, setPointer ] = useState(start)

  useEffect(() => {
    let frame = 0

    const follow = (event: DragEvent) => {
      const { clientX: x, clientY: y } = event
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setPointer(current => current.x === x && current.y === y ? current : { x, y }))
    }

    document.addEventListener('dragover', follow)

    return () => {
      document.removeEventListener('dragover', follow)
      cancelAnimationFrame(frame)
    }
  }, [])

  return pointer
}

export default DragFollower
