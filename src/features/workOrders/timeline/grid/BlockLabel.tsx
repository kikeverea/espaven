import { cn } from '@/lib/utils.ts'
import { MONO } from '@/features/workOrders/timeline/util/styles.ts'

type BlockLabelProps = {
  title: string
  sub: string | null
  titleClass: string
  subClass: string
}

/* A block's text: its title, and under it (or beside it, on a thin block) its subline */
const BlockLabel = ({ title, sub, titleClass, subClass }: BlockLabelProps) =>
  <>
    <span className={ cn('truncate text-[12.5px] leading-[1.25] font-semibold', titleClass) }>{ title }</span>
    { sub && <span className={ cn(MONO, 'truncate text-[11px] leading-[1.25]', subClass) }>{ sub }</span> }
  </>

export default BlockLabel
