import { cn } from '@/lib/utils.ts'
import { COMPLETED_STYLE, SCHEDULABLE_STYLES } from '@/features/schedulables/styles.ts'

/* What each colour stands for: a swatch per kind of schedulable, then what is done, as the blocks are drawn */
const Legend = () =>
  <ul className='flex flex-wrap items-center gap-3.5 text-xs text-[#D6D3D1]'>
    { [ ...Object.values(SCHEDULABLE_STYLES), COMPLETED_STYLE ].map(({ label, card }) =>
      <li key={ label } className='flex items-center gap-1.5'>
        <span className={ cn('size-2.5 rounded-[3px] border shadow-none', card) } />
        { label }
      </li>
    )}
  </ul>

export default Legend
