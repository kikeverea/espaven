import type { FormInquiry, Inquiry } from '../types'
import { api } from '@/api/apiClient'
import { createResource } from '@/api/resource.ts'
import { mapperFactory } from './inquiry.mapper.ts'

const { fetch } = api(mapperFactory())

/* Whether any active inquiry is new: no one has done anything with it yet */
const hasNew = async (): Promise<boolean> => {
  const { hasNew } = await fetch<{ hasNew: boolean }>('/inquiries/has_new')
  return hasNew
}

export default { ...createResource<Inquiry, FormInquiry>('/inquiries', mapperFactory()), hasNew }
