import { cn } from '@/lib/utils.ts'
import { TIMELINE_STATUS_STYLE } from '@/features/workOrders/timeline/util/styles.ts'

/* The swatches match the blocks; the pending one's border is drawn a little stronger to show on charcoal */
const ITEMS = [
  { label: TIMELINE_STATUS_STYLE.live.label, swatch: TIMELINE_STATUS_STYLE.live.card },
  { label: TIMELINE_STATUS_STYLE.todo.label, swatch: 'border-[#C9C5C0] bg-white' },
  { label: TIMELINE_STATUS_STYLE.done.label, swatch: TIMELINE_STATUS_STYLE.done.card },
  { label: TIMELINE_STATUS_STYLE.pause.label, swatch: TIMELINE_STATUS_STYLE.pause.card },
]

const Legend = () =>
  <ul className='flex flex-wrap items-center gap-3.5 text-xs text-[#D6D3D1]'>
    { ITEMS.map(({ label, swatch }) =>
      <li key={ label } className='flex items-center gap-1.5'>
        <span className={ cn('size-2.5 rounded-[3px] border shadow-none', swatch) } />
        { label }
      </li>
    )}
  </ul>

export default Legend
