import type { ApiMapper } from '@/api/apiClient'
import type { ForbiddenApiFields } from '@/api/entity.mapper'
import { camelize, snakeCase } from '@/lib/strings'
import type { FormVehicleListing, PhotoSlot, VehicleListing } from '@/features/vehicleListings/types'

const ROOT = 'vehicle_listing'

/* the slots come snake cased, like the keys: 'rear_seats' */
export const vehicleListingMapper: ApiMapper<VehicleListing, VehicleListing, ForbiddenApiFields> = {
  fromApi: listing => ({
    ...listing,
    equipment: listing.equipment ?? [],
    photos: (listing.photos ?? []).map(photo => ({ ...photo, slot: photo.slot ? camelize(photo.slot) as PhotoSlot : null })),
  }),
}

/*
 * A listing as a multipart form, so its photos go with it. Rails style keys under `vehicle_listing`,
 * the photos as accepts_nested_attributes_for takes them: new ones with their image, dropped ones
 * with _destroy. What is cleared goes blank, an empty list as one blank value
 */
export const toMultipart = (listing: FormVehicleListing): FormData => {
  const form = new FormData()
  const put = (key: string, value: string | Blob) => form.append(`${ROOT}${key}`, value)

  const { photos, ...fields } = listing

  Object.entries(fields).forEach(([ key, value ]) => {
    const name = `[${snakeCase(key)}]`

    if (Array.isArray(value) && !value.length)
      put(`${name}[]`, '')
    else if (Array.isArray(value))
      value.forEach(item => put(`${name}[]`, String(item)))
    else if (value !== undefined)
      put(name, value === null ? '' : String(value))
  })

  photos?.forEach((photo, index) => {
    const name = `[photos_attributes][${index}]`

    if ('remove' in photo) {
      put(`${name}[id]`, String(photo.id))
      put(`${name}[_destroy]`, 'true')
    }
    else {
      put(`${name}[slot]`, photo.slot ? snakeCase(photo.slot) : '')
      put(`${name}[image]`, photo.file)
    }
  })

  return form
}
