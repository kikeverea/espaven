import { QueryClient } from '@tanstack/react-query'
import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { createMongoAbility, ForbiddenError } from '@casl/ability'
import { routeTree } from '@/routeTree.gen'
import { rulesFor, type AppAbility } from '@/lib/ability'
import type { Role } from '@/features/users/types'

/* loads `path` as `role` would, and tells whether a guard turned it away */
const isDenied = async (role: Role, path: string) => {
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient(), ability: createMongoAbility<AppAbility>(rulesFor(role)) },
    history: createMemoryHistory({ initialEntries: [ path ] }),
  })

  await router.load()
  return router.state.matches.some(match => match.error instanceof ForbiddenError)
}

describe('route guards', () => {

  it.each([
    [ 'office', '/service_templates' ],
    [ 'office', '/service_templates/new' ],
    [ 'office', '/inventory_items' ],
    [ 'office', '/inventory_categories' ],
    [ 'office', '/units_of_measure' ],
    [ 'technician', '/inquiries' ],
  ] as [ Role, string ][])('keeps %s out of %s', async (role, path) => {
    expect(await isDenied(role, path)).toBe(true)
  })

  it.each([
    [ 'admin', '/service_templates' ],
    [ 'office', '/inquiries' ],
    [ 'office', '/inventory' ],
    [ 'technician', '/inventory' ],
    [ 'technician', '/work_orders' ],
  ] as [ Role, string ][])('lets %s into %s', async (role, path) => {
    expect(await isDenied(role, path)).toBe(false)
  })
})
