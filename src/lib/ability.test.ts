import { createMongoAbility } from '@casl/ability'
import { rulesFor, type AppAbility, type Subject } from '@/lib/ability'
import type { Role } from '@/features/users/types'

const readable = (role: Role) => {
  const ability = createMongoAbility<AppAbility>(rulesFor(role))
  const subjects: Subject[] = [
    'Inquiry', 'Contact', 'Service', 'ServiceTemplate',
    'Inventory', 'InventoryCategory', 'InventoryItem', 'UnitOfMeasure',
  ]

  return subjects.filter(subject => ability.can('read', subject))
}

describe('rulesFor', () => {

  test('admin reads everything', () => {
    expect(readable('admin')).toEqual([
      'Inquiry', 'Contact', 'Service', 'ServiceTemplate',
      'Inventory', 'InventoryCategory', 'InventoryItem', 'UnitOfMeasure',
    ])
  })

  test('office reads all but the service templates, and only the stock of the inventory', () => {
    expect(readable('office')).toEqual([ 'Inquiry', 'Contact', 'Service', 'Inventory' ])
  })

  test('technician reads what office does, but the CRM', () => {
    expect(readable('technician')).toEqual([ 'Service', 'Inventory' ])
  })
})
