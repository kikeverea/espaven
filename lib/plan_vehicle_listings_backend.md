# Plan — wire vehicle listings into the backend

Status (2026-10-18): planned, approved to read the backend, **nothing written in the backend yet**.
The user wants to review this plan before any backend change. Backend repo: `~/RubymineProjects/garages`
(Rails 8.1 API, jbuilder, FactoryBot integration tests, sqlite in dev, postgres :5433 in test).

The frontend side is done and committed in espaven (`src/features/vehicleListings/`), running on the
mock in `src/mocks/handlers.ts` (`writeListing`, `listingRows`) and `src/mocks/data.ts` (`vehicleListings`).

## Frontend contract (what espaven sends and expects)

- `GET /api/vehicle_listings` → `{ collection: [...] }`, `GET/PUT/DELETE /api/vehicle_listings/:id`,
  `POST /api/vehicle_listings`, `POST /api/vehicle_listings/batch_destroy`.
- Create/update are **multipart**, keys `vehicle_listing[...]`, snake cased:
  `name, status, price_cents, plate_number, year, kilometres, power, itv_until ('YYYY-MM'), fuel,
  gearbox, doors, emissions_tag, description`, `equipment[]` (an empty list arrives as one blank value),
  `photos_attributes[i][slot|image]` for new photos, `photos_attributes[i][id|_destroy]` for dropped ones.
  A replaced view = destroy old + create new with the same slot. Cleared values arrive as ''.
- Enum values: status `published|draft|reserved|sold`; fuel `petrol|diesel|hybrid|electric|lpg`;
  gearbox `manual|automatic`; doors `3|5`; emissions_tag `zero|eco|c|b|none`.
  Slots: `front34, side, rear34, interior, rear_seats, dashboard, engine, boot` (null = "otras fotos").
- Response: the fields + `id, created_at, updated_at`, `photos: [{ id, slot, url }]` (absolute url).

## Backend findings

- No vehicle listing model, routes or tables.
- ActiveStorage configured (`storage.yml`, `config.active_storage.service`) but **not installed**:
  no `active_storage_*` tables in `db/schema.rb`.
- Conventions: controllers inherit `Api::Controller`, `paginate(scope)`, `params.expect(model: [...])`,
  jbuilder `{ collection, pagination? }` via `shared/pagination`, string-valued enums.
- `paginate` caps at 100 per page when `page`/`per_page` is sent; without them it returns everything.

## Backend steps

1. `bin/rails active_storage:install`.
2. Migration `create_vehicle_listings`: `name` (null: false), `status` (string, default 'draft'),
   `price_cents`, `plate_number`, `year`, `kilometres`, `power` (integers), `itv_until` (string),
   `fuel`, `gearbox`, `emissions_tag` (strings), `doors` (integer), `equipment` (json, default []),
   `description` (text), timestamps.
3. Migration `create_vehicle_listing_photos`: `vehicle_listing` reference, `slot` (string, nullable),
   timestamps, unique index `[vehicle_listing_id, slot]`.
4. `VehicleListing`: enums (emissions_tag with `prefix: true` — `none` clashes with AR's `none`);
   validations (name presence, numeric ≥ 0, doors in [3, 5], itv_until `/\A\d{4}-\d{2}\z/`);
   `before_validation` compact_blank equipment; `has_many :photos, dependent: :destroy`,
   `accepts_nested_attributes_for :photos, allow_destroy: true`; validate unique slots in memory over
   photos not marked_for_destruction (a DB uniqueness validation fails on replace: destroy happens
   after validation).
5. `VehicleListingPhoto`: `belongs_to :vehicle_listing`, `has_one_attached :image`, slot inclusion in
   the 8 views (allow nil), image attached and `image/*`.
6. `VehicleListingsController`: index/show/create/update/destroy + `batch_destroy` (as providers);
   index `includes(photos: { image_attachment: :blob })`, `order(updated_at: :desc, id: :desc)`;
   params `params.expect(vehicle_listing: [ ...fields, equipment: [], photos_attributes: [[ :id, :slot, :image, :_destroy ]] ])`.
7. Route: `resources :vehicle_listings do post :batch_destroy, on: :collection end`.
8. jbuilder index/show/_vehicle_listing; photos `{ id, slot, url: rails_blob_url(photo.image) }`.
9. Factories + controller tests (list, create with upload, replace slot, _destroy, blank equipment,
   validation errors, delete) + model tests (duplicate slot, enums). Optional seeds
   `db/seeds/vehicle_listings.rb` with the 6 demo cars (asked the user, no answer yet).
10. `bin/rails db:migrate` in dev, run only the new test files.

## Frontend follow-up (espaven)

- Drop the `/vehicle_listings` mock handler and data (keep FormData pass-through in `mocks/server.ts`).
- `useVehicleListings`: stop sending `page/per_page` (`ALL`), so the list isn't capped at 100.

## Known gaps, out of scope (still mocked)

The service picker work assumes backend pieces that don't exist yet: front `/suppliers` (city, phone,
email, color) vs backend `/providers` (name only); `work_orders` doesn't permit `services_attributes`
or `entry_kilometres`; `vehicles` only permits `client_id, plate_number`; no `/clients` (backend has
`/contacts`); inventory categories have no `icon`.
