import { useState } from 'react'
import FullCalendar, { type EventClickInfo, type EventDropInfo } from '@fullcalendar/react'
import monarchTheme from '@fullcalendar/react/themes/monarch'
import timeGridPlugin from '@fullcalendar/react/timegrid'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import interactionPlugin from '@fullcalendar/react/interaction'
import esLocale from '@fullcalendar/react/locales/es'
import '@fullcalendar/react/skeleton.css'
import '@fullcalendar/react/themes/monarch/theme.css'
import '@fullcalendar/react/themes/monarch/palettes/blue.css'
import NavBar from '@/components/NavBar/NavBar'
import SideTray from '@/components/SideTray/SideTray'
import type { WorkOrder } from '@/features/workOrders/types'
import { useCalendarWorkOrders, useWorkOrderMutations } from '@/features/workOrders/useWorkOrders'
import { useServiceMutations, useServices } from '@/features/services/useServices'
import WorkOrderDetails from '@/features/workOrders/details/WorkOrderDetails'
import { calendarEvents, type EventSource } from '@/features/calendar/calendarEvents'

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

  const events = calendarEvents(workOrders?.collection ?? [], services?.collection ?? [])

  /* back where it was if it cannot be saved */
  const move = ({ event, revert }: EventDropInfo) => {
    const { kind, id } = event.extendedProps as EventSource
    const scheduledAt = event.start!.toISOString()

    if (kind === 'workOrder')
      workOrderMutations.update({ id, scheduledAt }, { onError: revert })
    else
      serviceMutations.update({ id, scheduledAt }, { onError: revert })
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

        <div className='mt-4'>
          <FullCalendar
            plugins={[ monarchTheme, timeGridPlugin, dayGridPlugin, interactionPlugin ]}
            locale={ esLocale }
            initialView='timeGridWeek'
            headerToolbar={{ start: 'prev,next today', center: 'title', end: 'timeGridDay,timeGridWeek,dayGridMonth' }}
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
        </div>
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
