import type { InventoryCategory } from '@/features/inventoryCategories/types'
import type { NewService, Service, ServiceWrite } from '@/features/services/types'
import type { DraftService, PickedService } from '@/features/services/picker/types'

/* A service to make, in the category it is being made from, if any */
export const newDraft = (inventoryCategory?: InventoryCategory): DraftService =>
  ({ name: '', labourMinutes: 30, items: [], saveAsTemplate: false, inventoryCategory })

/* Whether the draft can join the order: it has a name, and a category when it is kept */
export const isReady = (draft: DraftService) =>
  !!draft.name.trim() && (!draft.saveAsTemplate || !!draft.inventoryCategory)

export const nameOf = (service: PickedService) =>
  service.kind === 'existing' ? service.service.name
    : service.kind === 'template' ? service.template.name
    : service.name

/* The items a service uses, as far as the picker knows: an existing one's are not listed */
export const itemsOf = (service: PickedService) =>
  service.kind === 'existing' ? 0
    : service.kind === 'template' ? service.template.items?.length ?? 0
    : service.items.length

export const existing = (service: Service): PickedService =>
  ({ kind: 'existing', key: `service-${service.id}`, service, labourMinutes: service.labourMinutes })

type Added = Exclude<PickedService, { kind: 'existing' }>

/*
 * What the order is written with: the services added, a template's items with them and a made
 * one's with no quantity yet, and those it had and no longer does
 */
export const toServiceWrites = (services: PickedService[], dropped: Service[]): ServiceWrite[] => [
  ...toNewServices(services.filter((service): service is Added => service.kind !== 'existing')),
  ...dropped.map(({ id }) => ({ id, remove: true as const })),
]

const toNewServices = (services: Added[]): NewService[] =>
  services.map(service => service.kind === 'template'
    ? {
        serviceTemplateId: service.template.id,
        name: service.template.name,
        labourMinutes: service.labourMinutes,
        items: (service.template.items ?? []).map(({ inventoryItem, quantity }) => ({ inventoryItemId: inventoryItem.id, quantity: quantity ?? null })),
      }
    : {
        name: service.name.trim(),
        labourMinutes: service.labourMinutes,
        items: service.items.map(({ id }) => ({ inventoryItemId: id, quantity: null })),
        saveAsTemplate: service.saveAsTemplate,
        ...(service.saveAsTemplate && { inventoryCategoryId: service.inventoryCategory?.id }),
      })
