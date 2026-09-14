/* plop:imports */
import type { Contact, Inquiry, User } from '@/features/inquiries/types'
import type { UnitOfMeasure } from '@/features/unitsOfMeasure/types'
import type { Comment } from '@/features/comments/types'
import type { ServiceTemplate } from '@/features/serviceTemplates/types.ts'
import type { InventoryItem } from '@/features/inventory/types.ts'
import type { InventoryCategory } from '@/features/inventoryCategories/types.ts'

export const createFactories = () => {
  const ids = {
    /* plop:ids */
    user: 1,
    contact: 1,
    inquiry: 1,
    comment: 1,
    unitOfMeasure: 1,
    serviceTemplate: 1,
    inventoryItem: 1,
    inventoryCategory: 1
  }

  const now = () => new Date().toISOString()

  /* plop:factories */

  const user = (args: Partial<User> = {}): User => ({
    id: ids.user++,
    fullName: 'Test',
    lastName: 'User',
    email: 'test@user.com',
    createdAt: now(),
    ...args,
  })

  const contact = (args: Partial<Contact> = {}): Contact => ({
    id: ids.contact++,
    name: 'Test',
    lastName: 'Contact',
    emails: [{ address: 'test@contact.com', primary: true }],
    phoneNumbers: [{ number: '555 555 555', primary: true }],
    createdAt: now(),
    ...args,
  })

  const inquiry = (args: Partial<Inquiry> = {}): Inquiry => ({
    id: ids.inquiry++,
    contact: contact(),
    service: 'Test service',
    status: 'contacted',
    lastActivityAt: now(),
    comments: [],
    createdAt: now(),
    discardedAt: null,
    ...args,
  })

  const comment = (args: Partial<Comment> = {}): Comment => ({
    id: ids.comment++,
    body: 'Test comment',
    createdAt: now(),
    createdBy: user(),
    ...args
  })

  const unitOfMeasure = (args: Partial<UnitOfMeasure> = {}): UnitOfMeasure => ({
    id: ids.unitOfMeasure++,
    name: 'Test unit',
    createdAt: now(),
    ...args
  })

  const inventoryItem = (args: Partial<InventoryItem> = {}): InventoryItem => ({
    id: ids.inventoryItem++,
    name: 'Test item 1',
    stock: 15,
    sku: 'SKUT',
    unitOfMeasure: unitOfMeasure(),
    priceCents: 2000,
    createdAt: now(),
    ...args
  })

  const inventoryCategory = (args: Partial<InventoryCategory> = {}): InventoryCategory => ({
    id: ids.inventoryCategory++,
    name: 'Test item 1',
    appliesSigaus: false,
    createdAt: now(),
    ...args
  })

  const serviceTemplate = (args: Partial<ServiceTemplate> = {}): ServiceTemplate => ({
    id: ids.serviceTemplate++,
    name: 'Template 1',
    expectedMinutes: 60,
    priceCents: 2000,
    createdAt: now(),
    ...args
  })

  return {
    /* plop:exports */
    contact,
    comment,
    inquiry,
    user,
    inventoryItem,
    inventoryCategory,
    unitOfMeasure,
    serviceTemplate
  }
}