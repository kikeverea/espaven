import { createContext, type Dispatch, type ReactNode, useReducer } from 'react'
import type { WorkOrder } from '@/features/workOrders/types'
import type { ScheduleUnavailability } from '@/features/unavailabilities/types'
import type { dayPlan } from '@/features/workOrders/timeline/func/planner'
import type { ScheduleChange, Zoom } from '@/features/workOrders/timeline/util/types'
import { type DragAction, dragReducer, type DragState, initialDragState } from '@/features/workOrders/timeline/drag/dragReducer'

type DragContextValue = {
  state: DragState
  dispatch: Dispatch<DragAction>
  day: Date
  zoom: Zoom
  plan: ReturnType<typeof dayPlan>
  unavailabilities: ScheduleUnavailability[]
  schedule: (order: WorkOrder, change: ScheduleChange) => void
}

export const DragContext = createContext<DragContextValue | null>(null)

type DragProviderProps = Omit<DragContextValue, 'state' | 'dispatch'> & { children: ReactNode }

/* The timeline's drag and drop, for the rows, lanes and cards to share. Read it with useDrag */
export const DragProvider = ({ children, ...timeline }: DragProviderProps) => {
  const [ state, dispatch ] = useReducer(dragReducer, initialDragState)

  return (
    <DragContext.Provider value={{ state, dispatch, ...timeline }}>
      { children }
    </DragContext.Provider>
  )
}
