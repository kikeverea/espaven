# Handoff — Work Order, Inspection Form, Vehicle Listings

Reference designs (source of truth for exact values — colors, spacing, copy):

| View | File |
|---|---|
| Work order: services + providers | `Work Order Parts v2.dc.html` |
| Inspection form (65-point) | `Inspection Form.dc.html` |
| Vehicle listings + vehicle form | `Vehicle Listings.dc.html` |

`Work Order Parts.dc.html` (v1, items-only) is superseded — ignore it.

Screenshots live in `handoff/`. All data in the prototypes is demo data.

## Shared visual language

- Font: **Geist** (UI), **Geist Mono** (plates, hours, codes, counts). Vehicle tiles also use **Barlow Condensed** 700 uppercase for names/prices (matches client site).
- Header bar `#3A3532`, page bg `#E8E6E2`, card border `#DCD9D5`, inner dividers `#E3E0DC`, muted text `#78716C`.
- Primary action `#3366E0` (hover `#2A57C4`); disabled `#E7E5E2` bg / `#A8A29E` text.
- Section labels: 11px / 500 / uppercase / `letter-spacing:0.06em` / `#78716C`.
- Selected tile: border `#3366E0` + `0 0 0 1px #3366E0` ring + bg `#F3F6FE`.
- **Hours stepper** (used in 4 places): `[−] [input] h [+]`, step **0.25 h**, min 0.25, default 0.5. Input ≥54px wide so `0,75` never clips.
- **Slide-left navigation**: category grid and child grid sit in a 200%-wide track; `transform: translateX(-50%)`, `.38s cubic-bezier(.2,.8,.2,1)`. Breadcrumb `ROOT / Category  n` with a back chevron. Typing in search also slides to a results pane.

---

## 1. Work order — `Work Order Parts v2.dc.html`

Two steps shown in the header pill: **1 Servicios → 2 Proveedores**.

### Step 1 · Servicios

![](handoff/wo-1-categories.png)

- Search bar (services; switches to inventory search in create mode).
- `SERVICIOS` label + **Crear nuevo servicio** button.
- Grid of service categories (`auto-fill, minmax(190px,1fr)`): icon, name, `n servicios`, blue count badge of selected services.

![](handoff/wo-2-services.png)

- Clicking a category slides in **thin service cards in 2 columns** (CSS `columns: 2 280px` so expanding a card doesn't leave gaps).
- Card = checkbox + name + meta. Meta: leaf `0,75 h · 2 artículos`; parent `5 servicios · 2 h`.
- Parent services have a chevron button (right, divided) that expands child services. Parent checkbox selects/deselects all children; shows **indeterminate dash** when partially selected.
- Nothing selected and everything collapsed by default.

![](handoff/wo-3-new-service.png)

- **Create mode**: a blue panel with `Nombre del servicio` + hours stepper + `Añadir a la orden` (disabled until a name exists). The grid switches to **inventory categories**; clicking one slides to item tiles (multi-select, checkbox, spec in mono, stock — `Sin stock` amber `#B45309`).
- The draft shows at the top of the order list with chips for chosen items.

**Servicios de la orden** (right column, sticky; stacks under the content below ~880px): each service with hours, item count, `Nuevo` badge for created services, remove ×. Footer: total labour hours, item count, **Volver** / **Elegir proveedores** (disabled until ≥1 item is implied).

### Step 2 · Proveedores

![](handoff/wo-4-providers.png)

- **Artículos elegidos**: the union of items from all chosen services, as **single-select tabs**. Only the active item's providers are shown. Each tab shows status: `Sin proveedor elegido` / `Brand · Provider · price` / `n opciones · total`.
- One card per provider that offers the active item, sorted by cheapest offer. Card header is tinted with the provider's color (bg = light tint, avatar = solid, city text = solid, border = solid @ 30% alpha).
- Offer tile (248px, flex-wrap): icon, `Brand + item`, spec, tags `Mejor precio` (green) / `Entrega más rápida` (blue), **Última compra** date, last price, lead-time pill (`Llegó en n días`; ≤1 green, ≤3 neutral, >3 amber; `Sin historial` grey).
- **Multi-select**. Marker is a rounded square: single pick in a provider → ✓; 2+ picks **within the same provider** → order number 1, 2, 3 (numbering is scoped per provider, renumbers on unpick).
- Sticky footer: `x de y artículos con proveedor`, Total, Volver, Añadir a la orden.

---

## 2. Inspection form — `Inspection Form.dc.html`

![](handoff/insp-1-header.png)

- Header: title, OT/model/plate, progress bar `done/total`.
- Info row (3 columns): **Información** card · **Espaven logo (104px circle) above centre name/address/phone, no card** · **Vehículo** card. Card fields are inline-editable.
- Navigation: ≥1000px a left nav with sections; <1000px a horizontally scrollable chip row inside the sticky status bar. Chips show `done/total` and a red/orange dot when a section has issues.
- Legend with per-status counts acts as a filter.

### Status points

![](handoff/insp-2-points.png)

- Sections are **collapsed by default**. Section header: chevron, name, `done/total`, issue pills, `Pendientes a correcto` bulk action.
- Per point, 5 status buttons (dot only, `title` = label): Correcto `#3FA864`, Planificar sustitución `#E8833A`, Sustitución necesaria `#D9443A`, Realizado ajuste/cambio `#4C7BE8`, Realizado relleno `#2B4C9C`. ("Planificar sustitución por intervalo" was removed.)
- **Orange or red → show `Mano de obra` hours stepper** under the buttons (default 0.5 h).
- Some points are number/text inputs (mm, %, °C, tyre age, size, battery brand).
- Section "Fluidos" (renamed from Niveles líquidos) starts with **Nivel de aceite de motor**.

### Inspección de daños

![](handoff/insp-3-damage.png)

- **Seleccionar carrocería**: 5 body tiles (Coupé, Sedán, Familiar, SUV, Urbano) with a red mark-count badge. Marks are stored **per body type**.
- Click on the drawing → red X centred on the click (stored as **% x/y of the image**, so it survives resize) + numbered badge, then the modal opens. Clicking an existing X re-opens it.
- **Daños registrados** list: number, type chips, photo thumbs, edit on click, ×.

![](handoff/insp-4-damage-modal.png)

- Modal: multi-select chips **Arañazo superficial / Arañazo profundo / Golpe / Rotura**; **Añadir** photo tile (`accept="image/*" capture="environment"`, multiple). `Guardar` disabled until ≥1 chip. Cancelling a new mark removes the X; editing shows `Eliminar`.
- ⚠ The supplied body drawings carry 123RF watermarks — replace with licensed/clean assets (`bodies/`).

### Reparaciones complejas

![](handoff/insp-5-repairs.png)

- Same service picker as the work order (search, categories, slide-left, 2-column thin cards, expandable parents, Crear nuevo servicio with inventory picker) — **no providers step, no side list**.
- **Child service hours are editable** with the hours stepper; changes roll up to parent meta, summary and totals.

### Resumen de la inspección (below Comentarios)

![](handoff/insp-6-summary.png)

- Charcoal header with count pills (a sustituir / a planificar / reparaciones / daños).
- **Puntos con incidencia**: auto-populated with every red then orange point — dot, name, section, status pill, hours; click jumps to its section.
- **Reparaciones complejas**: every added service with hours, removable.
- Totals: Mano de obra · puntos, Mano de obra · reparaciones, Artículos, **Total mano de obra**.
- Hidden while a legend filter is active.

---

## 3. Vehicles — `Vehicle Listings.dc.html`

Light admin UI; only the preview card uses the client site's dark style.

### Listing

![](handoff/veh-1-listing.png)

- Header: logo, `Vehículos en venta`, `n vehículos · n publicados`, **Añadir vehículo**.
- Search (brand/model/plate) + status tabs with counts: Todos, Publicado, Borrador, Reservado, Vendido.
- Grid `auto-fill, minmax(270px,1fr)`. Tile: 4:3 cover photo (striped placeholder when empty), **gold price tag** `#C9A227` top-right (Barlow Condensed 700), status badge top-left, uppercase name, `year · km · fuel · gearbox`, footer plate · updated · `Editar`. Whole tile opens the form.

### Form

![](handoff/veh-2-photos.png)

- **Fotos**: one dropzone per view — 3/4 delantero, Lateral, 3/4 trasero, Interior, Asientos traseros, Cuadro / km, Motor, Maletero — plus **Otras fotos** (multi). Drag-over highlights (2px `#3366E0`, bg `#EEF3FD`, "Suelta aquí"). Filled slot shows image + ×. Counter `filled/8`.
- **Cover** = first filled slot in the order above (3/4 delantero normally); used by listing tile and preview.
- **Datos del anuncio**: Nombre, Precio (numeric, thousands-formatted, `€` suffix), Matrícula (mono, uppercase).

![](handoff/veh-3-specs-equip.png)

- **Ficha técnica** (8 cells, same as client site): Año, Kilómetros (km), Potencia (CV), ITV hasta (MM/AAAA) as inputs; Combustible, Cambio, Puertas, Distintivo as single-select segmented chips (selected = `#1C1917` fill).
- **Equipamiento destacado**: removable chips, input + Enter / Añadir, dashed suggestion chips.

![](handoff/veh-4-description.png)

- **Descripción**: textarea with character count; blank line = paragraph.

![](handoff/veh-5-preview.png)

- **Vista previa · web**: live client-style card (dark) + completeness checklist (Nombre y precio, Fotos de todas las vistas, Ficha técnica completa, Equipamiento ≥3, Descripción >40 chars).
- Sticky footer: status segmented control, Eliminar (existing only), Volver, Guardar (requires name).

---

## Data shapes (suggested)

```ts
interface ServiceLeaf { id: string; name: string; hours: number; items: string[] }  // item ids
interface ServiceGroup { id: string; name: string; kids: ServiceLeaf[] }
interface ServiceCategory { id: string; name: string; icon: string; list: (ServiceLeaf | ServiceGroup)[] }

interface Offer { supplierId: string; itemId: string; brand: string; price: number;
  lastPurchase: string | null; leadDays: number | null }
// WO selection: Record<itemId, offerKey[]>  — ordered; order index is shown per supplier

type PointStatus = 'ok' | 'plan' | 'replace' | 'adjusted' | 'refilled';
interface InspectionPoint { key: string; status?: PointStatus; hours?: number /* plan|replace only */ }
interface DamageMark { id: string; body: 'coupe'|'sedan'|'wagon'|'suv'|'city';
  x: number; y: number; /* % of image */ types: ('Arañazo superficial'|'Arañazo profundo'|'Golpe'|'Rotura')[]; photos: string[] }

interface Vehicle { id: string; name: string; price: number; plate: string;
  status: 'pub'|'draft'|'res'|'sold'; year: number; km: number; fuel: string; gear: string;
  power: number; doors: 3|5; tag: '0'|'ECO'|'C'|'B'|'Sin'; itv: string;
  equip: string[]; desc: string;
  slots: Partial<Record<'f34'|'side'|'r34'|'int'|'rear'|'dash'|'engine'|'trunk', string>>; photos: string[] }
```

## Open questions

- Confirm service catalogue, hours and item mapping come from backend (prototype hard-codes them).
- Should labour hours on inspection points be prefilled per point type rather than a flat 0.5 h?
- Confirm the final list of photo views for vehicles.
- Replace watermarked body drawings.
