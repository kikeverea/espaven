import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability'
import type { Role } from '@/features/users/types.ts'

export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete'

export type Subject =
  | 'all'
  | 'Inquiry'
  | 'Contact'
  | 'Service'
  | 'ServiceTemplate'
  | 'Inventory'
  | 'InventoryCategory'
  | 'InventoryItem'
  | 'UnitOfMeasure'

export type AppAbility = MongoAbility<[ Action, Subject ]>

/*
 * A local copy of what the api's cancancan Ability says. Once there is a signed in user, these
 * are replaced by the rules the api sends: `ability.update(rules)`
 */
export const rulesFor = (role: Role) => {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility)

  switch (role) {
    case 'admin':
      can('manage', 'all')
      break
    case 'office':
      can('manage', [ 'Inquiry', 'Contact', 'Service', 'Inventory' ])
      break
    case 'technician':
      can('manage', [ 'Service', 'Inventory' ])
      break
  }

  return rules
}

/* The one ability the app checks against, through AbilityProvider / useAbility */
export const ability = createMongoAbility<AppAbility>(rulesFor('admin'))
