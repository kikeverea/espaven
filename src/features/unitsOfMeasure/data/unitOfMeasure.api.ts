import type { FormUnitOfMeasure, UnitOfMeasure } from '../types'
import { createResource } from '@/api/resource.ts'

export default createResource<UnitOfMeasure, FormUnitOfMeasure>('/units_of_measure')
