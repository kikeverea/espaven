import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability'
import { notFound } from '@tanstack/react-router'
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

/* A route's beforeLoad: only who can `action` the `subject` gets in. Everyone else, a not found */
export const authorize = (action: Action, subject: Subject) =>
  ({ context }: { context: { ability: AppAbility } }) => {
    if (context.ability.cannot(action, subject))
      throw notFound()
  }
