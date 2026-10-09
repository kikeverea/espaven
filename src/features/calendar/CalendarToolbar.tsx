import type { CalendarController } from '@fullcalendar/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import NavButton from '@/features/workOrders/timeline/toolbar/NavButton.tsx'
import SegmentedControl from '@/features/workOrders/timeline/toolbar/SegmentedControl.tsx'
import { calendarTitle } from '@/features/calendar/calendarTitle'

const VIEWS = [
  { value: 'timeGridDay', label: 'Día' },
  { value: 'timeGridWeek', label: 'Semana' },
  { value: 'dayGridMonth', label: 'Mes' },
]

/* The calendar's charcoal bar, as the timeline's: moving through dates, what they are, and the view */
const CalendarToolbar = ({ controller }: { controller: CalendarController }) => {
  const buttons = controller.view && controller.getButtonState()

  return (
    <header className='flex flex-wrap items-center gap-4 border-b border-[#3A3532] bg-[#3A3532] px-[18px] py-3.5'>
      <div className='flex items-center gap-1'>
        <NavButton label='Anterior' onClick={() => controller.prev()}><ChevronLeft className='size-4' /></NavButton>
        <NavButton className='px-3 text-[#FAFAF9]' onClick={() => controller.today()} disabled={ buttons?.today.isDisabled }>Hoy</NavButton>
        <NavButton label='Siguiente' onClick={() => controller.next()}><ChevronRight className='size-4' /></NavButton>
      </div>

      <h2 className='text-[17px] leading-tight font-semibold tracking-[-.01em] text-[#FAFAF9] first-letter:uppercase'>
        { controller.view && calendarTitle(controller.view) }
      </h2>

      <div className='flex-1' />

      <SegmentedControl label='Vista' options={ VIEWS } value={ controller.view?.type } onChange={ view => controller.changeView(view) } />
    </header>
  )
}

export default CalendarToolbar
