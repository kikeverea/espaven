import { Fragment, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from '@/components/ui/toast'
import { resourceKeys } from '@/lib/mutations'
import type { WorkOrder } from '@/features/workOrders/types'
import type { ServiceTemplate } from '@/features/serviceTemplates/types'
import type { Service } from '@/features/services/types'
import type { Vehicle } from '@/features/vehicles/types'
import type { DraftService, PickedService } from '@/features/services/picker/types'
import { existing, toServiceWrites } from '@/features/services/picker/picked'
import { useWorkOrderById, useWorkOrderMutations } from '@/features/workOrders/useWorkOrders'
import { useServiceCatalogue } from '@/features/serviceTemplates/useServiceTemplates'
import { useWorkOrderServices } from '@/features/services/useServices'
import { FONT, MONO } from '@/features/workOrders/timeline/util/styles'
import ServicePicker from '@/features/services/picker/ServicePicker'
import PickedServicesList from '@/features/services/picker/PickedServicesList'
import VehicleCard from '@/features/vehicles/picker/VehicleCard'
import VehicleDialog from '@/features/vehicles/picker/VehicleDialog'
import { vehicleName } from '@/features/vehicles/picker/util'
import { format } from 'date-fns'

let drafts = 0

/*
 * An order's vehicle and services: the vehicle found or created, the services picked from the
 * catalogue or made there and then, all saved with the order at once. Without an id, the order is
 * a new one and is created with them
 */
const WorkOrderServices = ({ id }: { id?: WorkOrder['id'] }) => {
  const navigate = useNavigate()
  const client = useQueryClient()
  const { data: order } = useWorkOrderById(id)
  const { data: templates = [], isLoading } = useServiceCatalogue()
  const { create, update, status } = useWorkOrderMutations()

  const isNew = id == null
  const saving = !!(isNew ? status.pending.create : status.pending.update)

  const { data: had = [] } = useWorkOrderServices(id)

  const [ added, setAdded ] = useState<PickedService[]>([])
  const [ dropped, setDropped ] = useState<Service[]>([])
  const [ draft, setDraft ] = useState<DraftService | null>(null)

  /* the vehicle and kilometres, the order's until they are changed */
  const [ pickedVehicle, setPickedVehicle ] = useState<Vehicle | null>(null)
  const [ typedKilometres, setTypedKilometres ] = useState<{ value?: number } | null>(null)
  const [ choosingVehicle, setChoosingVehicle ] = useState(false)

  const vehicle = pickedVehicle ?? order?.vehicle ?? null
  const entryKilometres = typedKilometres ? typedKilometres.value : order?.entryKilometres ?? undefined
  const vehicleChanged = !!pickedVehicle && pickedVehicle.id !== order?.vehicle?.id

  /* what it has, but what is dropped or cancelled, then what is added */
  const services = [
    ...had.filter(service => service.status !== 'cancelled' && !dropped.some(({ id }) => id === service.id)).map(existing),
    ...added,
  ]

  const picked = new Set(added.flatMap(service => service.kind === 'template' ? [ service.template.id ] : []))

  const toggle = (templates: ServiceTemplate[], pick: boolean) => {
    const ids = new Set(templates.map(({ id }) => id))

    setAdded(pick
      ? [ ...added, ...templates
          .filter(({ id }) => !picked.has(id))
          .map(template => ({ kind: 'template' as const, key: `template-${template.id}`, template, labourMinutes: template.labourMinutes })) ]
      : added.filter(service => service.kind !== 'template' || !ids.has(service.template.id)))
  }

  const addDraft = () => {
    if (!draft) return
    setAdded([ ...added, { kind: 'new', key: `new-${++drafts}`, ...draft, name: draft.name.trim() } ])
    setDraft(null)
  }

  const back = () => navigate({ to: '/work_orders' })

  /* the order's services and the templates kept come back with it */
  const saved = () => {
    [ 'services', 'serviceTemplates' ].forEach(name => client.invalidateQueries({ queryKey: resourceKeys(name).all }))
    toast.add({ title: isNew ? 'Orden creada' : 'Cambios guardados', type: 'success' })
    back()
  }

  const remove = (service: PickedService) => service.kind === 'existing'
    ? setDropped([ ...dropped, service.service ])
    : setAdded(added.filter(({ key }) => key !== service.key))

  const save = () => isNew
    ? create({ vehicleId: vehicle?.id, entryKilometres, services: toServiceWrites(added, []) }, { onSuccess: saved })
    : update({
        id,
        ...(vehicleChanged && { vehicleId: vehicle?.id }),
        ...(typedKilometres && { entryKilometres: typedKilometres.value ?? null }),
        services: toServiceWrites(added, dropped),
      }, { onSuccess: saved })

  /* a new order needs its vehicle and a service at least, an existing one anything changed */
  const canSave = isNew
    ? !!vehicle && added.length > 0
    : added.length > 0 || dropped.length > 0 || vehicleChanged || !!typedKilometres

  /* what the order is for and since when: 'Toyota Corolla 1.8 Hybrid 2019 · 4521 KLM · Recepción 9:12' */
  const about = [
    vehicle && [ vehicleName(vehicle), vehicle.year ].filter(Boolean).join(' '),
    vehicle?.plateNumber && <span key='plate' className={ MONO }>{ vehicle.plateNumber }</span>,
    order && `Recepción ${format(new Date(order.createdAt), 'H:mm')}`,
  ].filter(Boolean)

  return (
    <div className={ `${FONT} min-h-full bg-[#E8E6E2] p-5 text-[#1C1917]` }>
      <div className='mx-auto max-w-[1280px] overflow-hidden rounded-[14px] border border-[#DCD9D5] bg-[#FBFAF9] shadow-sm'>
        <header className='flex min-h-[68px] flex-col justify-center gap-1 bg-[#3A3532] px-5 py-3.5 text-white'>
          <h1 className='text-[17px] font-semibold'>{ isNew ? 'Nueva orden' : `Editar orden · ${order?.number ?? ''}` }</h1>
          { about.length > 0 &&
            <p className='flex flex-wrap items-center gap-x-2.5 text-xs text-white/65'>
              { about.map((part, index) =>
                <Fragment key={ index }>
                  { index > 0 && <span aria-hidden>·</span> }
                  <span>{ part }</span>
                </Fragment>
              )}
            </p>
          }
        </header>

        <div className='grid items-start min-[880px]:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]'>
          <div className='flex min-w-0 flex-col gap-4 p-5'>
            <VehicleCard
              vehicle={ vehicle }
              entryKilometres={ entryKilometres }
              onEntryKilometres={ value => setTypedKilometres({ value }) }
              onChange={() => setChoosingVehicle(true)}
            />

            <ServicePicker
              templates={ templates }
              isLoading={ isLoading }
              picked={ picked }
              onToggle={ toggle }
              draft={ draft }
              onDraftChange={ setDraft }
              onAddDraft={ addDraft }
            />
          </div>

          <div className='self-stretch border-t border-[#E3E0DC] min-[880px]:border-t-0 min-[880px]:border-l'>
            <div className='p-5 min-[880px]:sticky min-[880px]:top-0'>
              <PickedServicesList
                services={ services }
                draft={ draft }
                onRemove={ remove }
                onDropDraftItem={ item => draft && setDraft({ ...draft, items: draft.items.filter(({ id }) => id !== item.id) }) }
                onBack={ back }
                onSave={ save }
                saving={ saving }
                canSave={ canSave }
                saveLabel={ isNew ? 'Crear orden' : 'Guardar cambios' }
              />
            </div>
          </div>
        </div>
      </div>

      <VehicleDialog open={ choosingVehicle } onOpenChange={ setChoosingVehicle } current={ vehicle } onPick={ setPickedVehicle } />
    </div>
  )
}

export default WorkOrderServices
