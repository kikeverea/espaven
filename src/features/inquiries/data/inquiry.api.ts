import type { FormInquiry, Inquiry } from '../types'
import { createResource } from '@/api/resource.ts'
import { mapperFactory } from './inquiry.mapper.ts'

export default createResource<Inquiry, FormInquiry>('/inquiries', mapperFactory())
