import type { Contact, FormContact } from '@/features/inquiries/types'
import { createResource } from '@/api/resource'

/* The workshop's clients: contacts, as /clients serves them */
export default createResource<Contact, FormContact>('/clients')
