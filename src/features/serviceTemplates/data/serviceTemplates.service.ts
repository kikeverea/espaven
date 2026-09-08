import type { FormServiceTemplate, ServiceTemplate } from '../types'
import { createResource } from '@/api/resource.ts'

export default createResource<ServiceTemplate, FormServiceTemplate>('/service_templates')
