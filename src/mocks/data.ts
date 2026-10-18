import type { Row } from '@/mocks/resource'

/* Demo data, snake cased as the api sends it */

const createdAt = '2026-09-01T09:00:00.000Z'
const unit = (id: number, name: string) => ({ id, name, created_at: createdAt })
const units = 1, litres = 2

export const categories = {
  oils: { id: 9001, name: 'Aceites y fluidos', icon: 'droplet' },
  brakes: { id: 9002, name: 'Frenos', icon: 'disc' },
  tyres: { id: 9003, name: 'Neumáticos', icon: 'circle-dot' },
  engine: { id: 9004, name: 'Motor', icon: 'cog' },
  electrics: { id: 9005, name: 'Electricidad', icon: 'zap' },
  climate: { id: 9006, name: 'Climatización', icon: 'snowflake' },
  filters: { id: 9007, name: 'Filtros', icon: 'filter' },
}

type Category = keyof typeof categories

let itemId = 9100
const item = (name: string, category: Category, price: number, stock: number, sku: string, unitOfMeasure = units) => ({
  id: itemId++,
  name,
  sku,
  stock,
  price_cents: price * 100,
  unit_of_measure: unit(unitOfMeasure, unitOfMeasure === litres ? 'Litros' : 'Unidades'),
  inventory_category: { ...categories[category], created_at: createdAt },
  created_at: createdAt,
})

export const items = {
  oil: item('Aceite 5W30 sintético', 'oils', 9, 42, 'OIL-5W30', litres),
  oilFilter: item('Filtro de aceite', 'filters', 8, 14, 'FLT-OIL'),
  airFilter: item('Filtro de aire', 'filters', 14, 9, 'FLT-AIR'),
  cabinFilter: item('Filtro de habitáculo', 'filters', 12, 0, 'FLT-CAB'),
  fuelFilter: item('Filtro de combustible', 'filters', 22, 4, 'FLT-FUEL'),
  frontPads: item('Pastillas de freno delanteras', 'brakes', 38, 6, 'BRK-PAD-F'),
  rearPads: item('Pastillas de freno traseras', 'brakes', 32, 3, 'BRK-PAD-R'),
  frontDiscs: item('Discos de freno delanteros', 'brakes', 76, 2, 'BRK-DSC-F'),
  brakeFluid: item('Líquido de frenos DOT 4', 'oils', 7, 18, 'FLD-DOT4', litres),
  coolant: item('Anticongelante G12', 'oils', 6, 25, 'FLD-G12', litres),
  tyre: item('Neumático 205/55 R16', 'tyres', 84, 12, 'TYR-2055516'),
  valve: item('Válvula de neumático', 'tyres', 2, 60, 'TYR-VLV'),
  patch: item('Parche de reparación', 'tyres', 3, 0, 'TYR-PTC'),
  timingKit: item('Kit de distribución', 'engine', 165, 1, 'ENG-TMG'),
  waterPump: item('Bomba de agua', 'engine', 89, 2, 'ENG-WPM'),
  sparkPlug: item('Bujía de iridio', 'engine', 11, 16, 'ENG-SPK'),
  battery: item('Batería 70 Ah', 'electrics', 112, 3, 'ELC-BAT70'),
  bulb: item('Lámpara H7', 'electrics', 6, 0, 'ELC-H7'),
  refrigerant: item('Gas R1234yf', 'climate', 45, 5, 'CLM-R1234'),
}

type Item = keyof typeof items

let templateId = 9500
const template = (name: string, minutes: number, uses: [ Item, number? ][] = [], parentId?: number, category?: Category): Row => ({
  id: templateId++,
  name,
  labour_minutes: minutes,
  price_cents: minutes * 75,
  parent_id: parentId ?? null,
  inventory_category_id: category ? categories[category].id : null,
  items: uses.map(([ name, quantity ]) => ({ inventory_item: items[name], quantity: quantity ?? null })),
  created_at: createdAt,
})

/* A group with its children, each in the group's category */
const group = (name: string, category: Category, children: [ string, number, [ Item, number? ][]? ][]): Row[] => {
  const parent = template(name, 0, [], undefined, category)
  return [ parent, ...children.map(([ name, minutes, uses ]) => template(name, minutes, uses, parent.id)) ]
}

const leaf = (category: Category, name: string, minutes: number, uses: [ Item, number? ][] = []) =>
  template(name, minutes, uses, undefined, category)

export const serviceTemplates: Row[] = [
  leaf('oils', 'Cambio de aceite y filtro', 45, [ [ 'oil', 5 ], [ 'oilFilter', 1 ] ]),
  leaf('oils', 'Cambio de anticongelante', 60, [ [ 'coolant', 6 ] ]),
  ...group('Revisión oficial', 'oils', [
    [ 'Aceite y filtro', 45, [ [ 'oil', 5 ], [ 'oilFilter', 1 ] ] ],
    [ 'Filtro de aire', 15, [ [ 'airFilter', 1 ] ] ],
    [ 'Filtro de habitáculo', 15, [ [ 'cabinFilter', 1 ] ] ],
    [ 'Filtro de combustible', 30, [ [ 'fuelFilter', 1 ] ] ],
    [ 'Revisión de niveles', 15 ],
  ]),

  leaf('brakes', 'Pastillas delanteras', 60, [ [ 'frontPads', 1 ] ]),
  leaf('brakes', 'Pastillas traseras', 60, [ [ 'rearPads', 1 ] ]),
  leaf('brakes', 'Discos y pastillas delanteros', 90, [ [ 'frontDiscs', 1 ], [ 'frontPads', 1 ] ]),
  ...group('Frenos completos', 'brakes', [
    [ 'Pastillas delanteras', 60, [ [ 'frontPads', 1 ] ] ],
    [ 'Pastillas traseras', 60, [ [ 'rearPads', 1 ] ] ],
    [ 'Cambio de líquido de frenos', 45, [ [ 'brakeFluid', 1 ] ] ],
  ]),

  leaf('tyres', 'Montaje y equilibrado (4 uds.)', 60, [ [ 'tyre', 4 ], [ 'valve', 4 ] ]),
  leaf('tyres', 'Alineación', 45),
  leaf('tyres', 'Reparación de pinchazo', 30, [ [ 'patch' ] ]),

  ...group('Distribución', 'engine', [
    [ 'Kit de distribución', 240, [ [ 'timingKit', 1 ] ] ],
    [ 'Bomba de agua', 60, [ [ 'waterPump', 1 ], [ 'coolant' ] ] ],
  ]),
  leaf('engine', 'Cambio de bujías', 45, [ [ 'sparkPlug', 4 ] ]),
  leaf('engine', 'Diagnosis', 30),

  leaf('electrics', 'Cambio de batería', 15, [ [ 'battery', 1 ] ]),
  leaf('electrics', 'Cambio de lámparas', 15, [ [ 'bulb' ] ]),

  leaf('climate', 'Carga de aire acondicionado', 45, [ [ 'refrigerant' ] ]),
  leaf('climate', 'Limpieza de circuito', 30),
]

export const suppliers: Row[] = [
  { id: 1, name: 'Recambios Norte', city: 'Bilbao', phone: '944 123 456', email: 'pedidos@recambiosnorte.es', color: '#2F7D5B', created_at: createdAt },
  { id: 2, name: 'AutoParts Levante', city: 'Valencia', phone: '963 654 321', email: 'ventas@autopartslevante.es', color: '#C2410C', created_at: createdAt },
  { id: 3, name: 'Distribuciones Meseta', city: 'Valladolid', phone: '983 222 111', color: '#6D28D9', created_at: createdAt },
  { id: 4, name: 'Neumáticos Sur', city: 'Sevilla', email: 'info@neumaticossur.es', color: '#0E7490', created_at: createdAt },
]

const contact = (id: number, name: string, last_name: string, phone: string) =>
  ({ id, name, last_name, phone_numbers: [ { number: phone, primary: true } ], emails: [], created_at: createdAt })

export const clients: Row[] = [
  contact(9301, 'Laura', 'Martín Soler', '612 345 678'),
  contact(9302, 'Moisés', 'Evelio', '634 112 908'),
  contact(9303, 'Andrés', 'Pons', '655 870 231'),
  contact(9304, 'Carmen', 'Ruiz Gil', '699 441 002'),
  contact(9305, 'Javier', 'Ortega Blanco', '622 019 774'),
  contact(9306, 'Lucía', 'Navarro', '671 552 380'),
]

/* when it was created: days ago, so the recent ones stay recent whenever the mocks run */
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

const vehicle = (id: number, plate_number: string, make: string, model: string, year: number, fuel: string, kilometres: number, vin: string, client_id: number, created: number): Row =>
  ({ id, plate_number, make, model, year, fuel, kilometres, vin, client_id, engine_size: '1.598 cc', doors: 5, seats: 5, created_at: daysAgo(created) })

export const vehicles: Row[] = [
  vehicle(9401, '4521 KLM', 'Toyota', 'Corolla 1.8 Hybrid', 2019, 'Híbrido', 58900, 'JTDKB20U503456789', 9301, 0),
  vehicle(9402, '6411 LJD', 'Fiat', '500X 1.3 MultiJet', 2020, 'Diésel', 34862, 'ZFA33400000123456', 9302, 0),
  vehicle(9403, '2290 LBM', 'Seat', 'Ibiza 1.0 TSI Style', 2020, 'Gasolina', 54200, 'VSSZZZKJZLR012345', 9303, 1),
  vehicle(9404, '7713 JWS', 'Renault', 'Clio 1.5 dCi', 2018, 'Diésel', 118900, 'VF15R000061234567', 9304, 1),
  vehicle(9405, '1184 HGT', 'Volkswagen', 'Golf 2.0 TDI', 2013, 'Diésel', 201450, 'WVWZZZAUZDW123456', 9305, 30),
  vehicle(9406, '9032 MBC', 'Peugeot', '308 1.5 BlueHDi', 2022, 'Diésel', 21300, 'VF3LBYHZPNS123456', 9306, 60),
  vehicle(9407, '5520 KZR', 'Kia', 'Niro HEV', 2019, 'Híbrido', 77000, 'KNACC81CGK5123456', 9301, 200),
]

const listing = (id: number, name: string, status: string, euros: number, plate_number: string, year: number, kilometres: number, fuel: string, gearbox: string, updated: number, more: Row | object = {}): Row => ({
  id, name, status, price_cents: euros * 100, plate_number, year, kilometres, fuel, gearbox,
  power: null, itv_until: null, doors: 5, emissions_tag: null, equipment: [], description: null, photos: [],
  created_at: daysAgo(updated + 10), updated_at: daysAgo(updated),
  ...more,
})

export const vehicleListings: Row[] = [
  listing(9501, 'Peugeot 308 1.5 BlueHDi', 'published', 12900, '9032 MBC', 2019, 96400, 'diesel', 'manual', 1, {
    power: 130, itv_until: '2027-05', emissions_tag: 'c',
    equipment: [ 'Climatizador', 'Navegador', 'Cámara trasera', 'Control de crucero' ],
    description: 'Revisado en nuestro taller, con mantenimiento al día y distribución cambiada a los 90.000 km.\n\nUn solo propietario. Garantía de 12 meses.',
  }),
  listing(9502, 'Seat Ibiza 1.0 TSI Style', 'published', 11500, '2290 LBM', 2020, 54200, 'petrol', 'manual', 3),
  listing(9503, 'Renault Clio 1.5 dCi', 'reserved', 8400, '7713 JWS', 2018, 118900, 'diesel', 'manual', 2),
  listing(9504, 'Volkswagen Golf 1.6 TDI', 'draft', 10200, '1184 HGT', 2017, 142300, 'diesel', 'manual', 0),
  listing(9505, 'Toyota Yaris 1.5 Hybrid', 'published', 14700, '4521 KLM', 2021, 41700, 'hybrid', 'automatic', 5),
  listing(9506, 'Citroën C4 Cactus PureTech', 'sold', 11900, '6411 LJD', 2019, 72800, 'petrol', 'automatic', 12),
]
