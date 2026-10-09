import { zooms } from '@/features/workOrders/timeline/func/timeline.ts'
import type { Zoom } from '@/features/workOrders/timeline/util/types'
import SegmentedControl from '@/features/workOrders/timeline/toolbar/SegmentedControl.tsx'

type ZoomControlProps = {
  zoom: Zoom
  onChange: (zoom: Zoom) => void
}

/* 15 min, 30 min, 1 h */
const ZoomControl = ({ zoom, onChange }: ZoomControlProps) =>
  <SegmentedControl label='Intervalo' options={ zooms } value={ zoom } onChange={ onChange } />

export default ZoomControl
