import type { FormGenericPart, GenericPart } from '../types'
import { createResource } from '@/api/resource.ts'

export default createResource<GenericPart, FormGenericPart>('/generic_parts')
