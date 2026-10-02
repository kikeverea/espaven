import type { FormService, Service } from '../types'
import { createResource } from '@/api/resource'

export default createResource<Service, FormService>('/services')
