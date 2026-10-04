import { TriangleAlert } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { spanOf } from '@/features/workOrders/timeline/func/planner'
import { clock } from '@/lib/time'
import useDrag from '@/features/workOrders/timeline/hooks/useDrag'

/* Asks before taking an order off the timeline back to waiting: a correction, rarely what is meant */
const UnscheduleDialog = () => {
  const { unscheduling, confirmUnschedule, cancelUnschedule } = useDrag()
  const order = unscheduling?.order      // open while there is one

  return (
    <AlertDialog open={ order != null } onOpenChange={ open => { if (!open) cancelUnschedule() } }>
      <AlertDialogContent>
        { order &&
          <>
            <AlertDialogHeader>
              <AlertDialogMedia className='bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'>
                <TriangleAlert />
              </AlertDialogMedia>
              <AlertDialogTitle>¿Sacar la orden de la programación?</AlertDialogTitle>
              <AlertDialogDescription>
                { order.status === 'inProgress'
                  ? <>{ order.number } · { order.name } ya está en curso. </>
                  : <>{ order.number } · { order.name } está programada a las { clock(spanOf(order).start) }. </>
                }
                Volverá a Sin programar, como pendiente.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className='bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-600/30'
                onClick={ confirmUnschedule }
              >
                Sacar de la programación
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        }
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default UnscheduleDialog
