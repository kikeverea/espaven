import type { FormVehicle, Vehicle } from '../types'
import { createResource } from '@/api/resource.ts'

export default createResource<Vehicle, FormVehicle>('/vehicles')
