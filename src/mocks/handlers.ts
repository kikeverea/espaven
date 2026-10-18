import { mockResource, type Row } from '@/mocks/resource'
import type { MockHandler } from '@/mocks/server'
import { categories, clients, items, serviceTemplates, suppliers, vehicleListings, vehicles } from '@/mocks/data'

/*
 * Service templates with what the picker needs: categories, children and items. `roots=true`
 * keeps the top level ones, their children within them
 */
const categoryRows = Object.values(categories).map(category => ({ ...category, created_at: '2026-09-01T09:00:00.000Z' }))
const categoryOf = (row: Row) => categoryRows.find(({ id }) => id === row.inventory_category_id)

const templates = mockResource('/service_templates', serviceTemplates, {
  scope: (rows, params) => params.get('roots') === 'true' ? rows.filter(row => !row.parent_id) : rows,
  serialize: (row, rows) => {
    const parent = rows.find(({ id }) => id === row.parent_id)
    const children = rows.filter(({ parent_id }) => parent_id === row.id)

    return {
      ...row,
      labour_minutes: children.length
        ? children.reduce((minutes, child) => minutes + Number(child.labour_minutes), 0)
        : row.labour_minutes,
      inventory_category: categoryOf(row) ?? null,
      parent: parent ?? null,
      children: children.map(child => ({ ...child, children: [] })),
    }
  },
})

const inventoryItems = mockResource('/inventory_items', Object.values(items), {
  searchIn: [ 'name', 'sku' ],
  scope: (rows, params) => {
    const ids = params.getAll('filter[inventory_category_id][]').map(Number)
    return ids.length ? rows.filter(row => ids.includes((row.inventory_category as Row).id)) : rows
  },
})

/*
 * A work order written with services, as services_attributes. The api does not take them yet:
 * the order goes on without them, and those kept as templates join the catalogue
 */
type ServiceAttributes = {
  name: string
  labour_minutes: number
  items_attributes: { inventory_item_id: number, quantity: number | null }[]
  save_as_template?: boolean
  inventory_category_id?: number
}

const writeWorkOrder: MockHandler = ({ method, path, body, forward }) => {
  if (!/^\/work_orders(\/\d+)?$/.test(path) || ![ 'POST', 'PUT' ].includes(method))
    return undefined

  const { services_attributes: services, ...order } = body as { services_attributes?: ServiceAttributes[] }
  if (!services)
    return undefined

  services.filter(({ save_as_template }) => save_as_template).forEach(service =>
    templates.insert({
      name: service.name,
      labour_minutes: service.labour_minutes,
      price_cents: 0,
      parent_id: null,
      inventory_category_id: service.inventory_category_id,
      items: service.items_attributes.map(({ inventory_item_id, quantity }) =>
        ({ inventory_item: Object.values(items).find(({ id }) => id === inventory_item_id), quantity })),
    }))

  console.debug('[mock] services_attributes, left out of', method, path, services)
  return forward(order)
}

/* Vehicles with their client, searched by plate, make, model, bastidor or the client's name */
const clientName = (id: unknown) => {
  const client = clients.find(client => client.id === id)
  return client ? `${client.name} ${client.last_name}` : ''
}

const vehicleRows = mockResource('/vehicles', vehicles.map(vehicle => ({ ...vehicle, client_name: clientName(vehicle.client_id) })), {
  searchIn: [ 'plate_number', 'make', 'model', 'vin', 'client_name' ],
  scope: (rows, params) => {
    const since = params.get('filter[created_at][min]')
    return since ? rows.filter(row => String(row.created_at) >= since) : rows
  },
  serialize: ({ client_name: _, ...vehicle }) => ({ ...vehicle, client: clients.find(({ id }) => id === vehicle.client_id) ?? null }),
})

/* a vehicle created through the api is searchable by its client's name too */
const createVehicle: MockHandler = request => {
  if (request.method !== 'POST' || request.path !== '/vehicles')
    return undefined

  const body = request.body as Row
  return vehicleRows.insert({ ...body, client_name: clientName(body.client_id) })
}

/*
 * Vehicles for sale, written as multipart forms. The photos sent are kept as object urls for as
 * long as the page lives; those marked _destroy go
 */
const listingRows = mockResource('/vehicle_listings', vehicleListings, { searchIn: [ 'name', 'plate_number' ] })

const NUMBERS = [ 'price_cents', 'year', 'kilometres', 'power', 'doors' ]
let photoId = 9600

const fromForm = (form: FormData, had: Row[]) => {
  const row: Record<string, unknown> = {}
  const photos: Record<string, Record<string, FormDataEntryValue>> = {}

  for (const [ key, value ] of form.entries()) {
    const [ , field, rest ] = key.match(/^vehicle_listing\[(\w+)\](.*)$/) ?? []

    if (field === 'photos_attributes') {
      const [ , index, attribute ] = rest.match(/^\[(\d+)\]\[(\w+)\]$/) ?? []
      photos[index] = { ...photos[index], [attribute]: value }
    }
    else if (rest === '[]')
      row[field] = [ ...(row[field] as unknown[] ?? []), value ].filter(Boolean)
    else
      row[field] = value === '' ? null : NUMBERS.includes(field) ? Number(value) : value
  }

  const dropped = Object.values(photos).filter(photo => photo._destroy).map(photo => Number(photo.id))
  const added = Object.values(photos).filter(photo => photo.image instanceof File)
    .map(photo => ({ id: photoId++, slot: photo.slot || null, url: URL.createObjectURL(photo.image as File) }))

  return { ...row, photos: [ ...had.filter(({ id }) => !dropped.includes(id)), ...added ], updated_at: new Date().toISOString() }
}

const writeListing: MockHandler = request => {
  const written = request.path.match(/^\/vehicle_listings(?:\/(\d+))?$/)
  if (!written || !(request.body instanceof FormData) || ![ 'POST', 'PUT' ].includes(request.method))
    return undefined

  const [ , id ] = written
  const had = id ? listingRows.find(Number(id))?.photos as Row[] ?? [] : []
  return listingRows.handle({ ...request, body: fromForm(request.body, had) })
}

export const handlers: MockHandler[] = [
  writeListing,
  listingRows.handle,
  createVehicle,
  vehicleRows.handle,
  mockResource('/clients', clients, { searchIn: [ 'name', 'last_name' ] }).handle,
  templates.handle,
  writeWorkOrder,
  mockResource('/inventory_categories', categoryRows).handle,
  inventoryItems.handle,
  mockResource('/suppliers', suppliers, { searchIn: [ 'name', 'city' ] }).handle,
]
