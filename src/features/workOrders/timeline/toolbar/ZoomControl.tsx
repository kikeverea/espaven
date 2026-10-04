import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { zooms } from '@/features/workOrders/timeline/func/timeline.ts'
import type { Zoom } from '@/features/workOrders/timeline/util/types'

type ZoomControlProps = {
  zoom: Zoom
  onChange: (zoom: Zoom) => void
}

/* 15 min, 30 min, 1 h: a segmented control, sunk into the charcoal toolbar */
const ZoomControl = ({ zoom, onChange }: ZoomControlProps) =>
  <Tabs value={ zoom } onValueChange={ value => onChange(value as Zoom) }>
    <TabsList aria-label='Intervalo' className='h-auto gap-0.5 rounded-lg bg-[#2C2825] p-[3px]'>
      { zooms.map(({ value, label }) =>
        <TabsTrigger
          key={ value }
          value={ value }
          className='h-[26px] flex-none rounded-md border-0 px-2.5 text-xs font-medium text-[#C4BEB8] hover:text-white data-active:bg-white data-active:text-[#1C1917] data-active:shadow-[0_1px_2px_rgba(28,25,23,.12)]'
        >
          { label }
        </TabsTrigger>
      )}
    </TabsList>
  </Tabs>

export default ZoomControl
