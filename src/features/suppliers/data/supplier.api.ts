import type { FormSupplier, Supplier } from '../types'
import { createResource } from '@/api/resource.ts'

export default createResource<Supplier, FormSupplier>('/suppliers')
