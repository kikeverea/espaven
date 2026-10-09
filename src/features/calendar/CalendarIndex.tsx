import { useState } from 'react'
import FullCalendar, { type EventClickInfo, type EventDropInfo, useCalendarController } from '@fullcalendar/react'
import monarchTheme from '@fullcalendar/react/themes/monarch'
import timeGridPlugin from '@fullcalendar/react/timegrid'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import interactionPlugin from '@fullcalendar/react/interaction'
import esLocale from '@fullcalendar/react/locales/es'
import '@fullcalendar/react/skeleton.css'
import '@fullcalendar/react/themes/monarch/theme.css'
import '@fullcalendar/react/themes/monarch/palettes/blue.css'
import NavBar from '@/components/NavBar/NavBar'
import { cn } from '@/lib/utils'
import SideTray from '@/components/SideTray/SideTray'
import type { WorkOrder } from '@/features/workOrders/types'
import { useCalendarWorkOrders, useWorkOrderMutations } from '@/features/workOrders/useWorkOrders'
import { useServiceMutations, useServices } from '@/features/services/useServices'
import WorkOrderDetails from '@/features/workOrders/details/WorkOrderDetails'
import type { EventSource } from '@/features/calendar/calendarEvents'
import { useCalendarEvents } from '@/features/calendar/useCalendarEvents'
import CalendarToolbar from '@/features/calendar/CalendarToolbar'

/*
 * The theme's colours, in Tailwind's nearest: today in yellow-600 (to #D39F34), where the theme marks
 * it in its tertiary, and events in sky-800 (to its #415F91). Each kind of schedulable brings its own
 * colour; this one is only for those that have none yet
 */
const COLOURS = [
  '[--fc-monarch-event:var(--color-sky-800)]',
  '[--fc-monarch-event-contrast:var(--color-white)]',
  '[--fc-monarch-tertiary:var(--color-yellow-600)]',
  '[--fc-monarch-tertiary-foreground:var(--color-white)]',
  '[--fc-monarch-tertiary-over:var(--color-yellow-500)]',
  '[--fc-monarch-tertiary-down:var(--color-yellow-400)]',
].join(' ')

/*
 * Everything with a time, work orders and services, by week, day or month. Moving an event
 * reschedules it; how long it takes stays. A work order opens in the side tray
 */
const CalendarIndex = () => {
  const workOrderMutations = useWorkOrderMutations()
  const serviceMutations = useServiceMutations()

  const { data: workOrders } = useCalendarWorkOrders()
  const { data: services } = useServices('active')
  const [ selected, setSelected ] = useState<WorkOrder | null>(null)
  const controller = useCalendarController()      // for the toolbar, which stands in for the calendar's own

  const events = useCalendarEvents(workOrders?.collection ?? [], services?.collection ?? [], workOrderMutations, serviceMutations)

  const move = ({ event }: EventDropInfo) => {
    const { kind, id } = event.extendedProps as EventSource
    const scheduledAt = event.start!.toISOString()

    if (kind === 'workOrder')
      workOrderMutations.update({ id, scheduledAt })
    else
      serviceMutations.update({ id, scheduledAt })
  }

  const open = ({ event }: EventClickInfo) => {
    const { kind, id } = event.extendedProps as EventSource
    if (kind === 'workOrder')
      setSelected(workOrders?.collection.find(order => order.id === id) ?? null)
  }

  return (
    <div className='flex w-full h-full'>
      <div className='min-w-0 flex-1 px-5 pb-8'>
        <NavBar label='Calendario' />

        <section className={ cn('mt-4 overflow-hidden rounded-xl border border-[#D6D3CF] bg-white shadow-[0_1px_2px_rgba(28,25,23,.05)]', COLOURS) }>
          <CalendarToolbar controller={ controller } />

          <FullCalendar
            controller={ controller }
            headerToolbar={ false }
            borderless
            plugins={[ monarchTheme, timeGridPlugin, dayGridPlugin, interactionPlugin ]}
            locale={ esLocale }
            initialView='timeGridWeek'
            firstDay={ 1 }
            slotMinTime='08:00'
            slotMaxTime='20:00'
            allDaySlot={ false }
            nowIndicator
            editable
            eventDurationEditable={ false }
            events={ events }
            eventDrop={ move }
            eventClick={ open }
          />
        </section>
      </div>

      <SideTray show={ !!selected } className='overflow-y-auto p-0'>
        { selected &&
          <WorkOrderDetails key={ selected.id } order={ selected } mutations={ workOrderMutations } onClose={() => setSelected(null)} />
        }
      </SideTray>
    </div>
  )
}

export default CalendarIndex
