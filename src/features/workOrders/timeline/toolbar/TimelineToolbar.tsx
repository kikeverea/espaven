import { addDays, format, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Zoom } from '@/features/workOrders/timeline/util/types'
import NavButton from '@/features/workOrders/timeline/toolbar/NavButton.tsx'
import Legend from '@/features/workOrders/timeline/toolbar/Legend.tsx'
import ZoomControl from '@/features/workOrders/timeline/toolbar/ZoomControl.tsx'

export type TimelineCounts = { scheduled: number, paused: number, unscheduled: number }

type TimelineToolbarProps = {
  day: Date
  zoom: Zoom
  counts: TimelineCounts
  onDayChange: (day: Date) => void
  onZoomChange: (zoom: Zoom) => void
}

/* The charcoal bar on top: the day and how to move through days, what is on it, the legend and the zoom */
const TimelineToolbar = ({ day, zoom, counts, onDayChange, onZoomChange }: TimelineToolbarProps) =>
  <header className='flex flex-wrap items-center gap-4 border-b border-[#3A3532] bg-[#3A3532] px-[18px] py-3.5'>
    <div className='flex items-center gap-1'>
      <NavButton label='Día anterior' onClick={() => onDayChange(addDays(day, -1))}><ChevronLeft className='size-4' /></NavButton>
      <NavButton className='px-3 text-[#FAFAF9]' onClick={() => onDayChange(new Date())} disabled={ isToday(day) }>Hoy</NavButton>
      <NavButton label='Día siguiente' onClick={() => onDayChange(addDays(day, 1))}><ChevronRight className='size-4' /></NavButton>
    </div>

    <div>
      <h2 className='text-[17px] leading-tight font-semibold tracking-[-.01em] text-[#FAFAF9] first-letter:uppercase'>
        { format(day, "EEEE, d 'de' MMMM", { locale: es }) }
      </h2>
      <p className='flex flex-wrap items-center gap-2.5 text-xs text-[#C4BEB8]'>
        <span>{ counts.scheduled } programadas</span>
        <span aria-hidden='true' className='text-[#78716C]'>·</span>
        <span>{ counts.paused } en pausa</span>
        <span aria-hidden='true' className='text-[#78716C]'>·</span>
        <span className='font-medium text-[#F5B455]'>{ counts.unscheduled } sin programar</span>
      </p>
    </div>

    <div className='flex-1' />

    <Legend />
    <ZoomControl zoom={ zoom } onChange={ onZoomChange } />
  </header>

export default TimelineToolbar
