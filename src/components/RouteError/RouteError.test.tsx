import { screen } from '@testing-library/react'
import { createMongoAbility, ForbiddenError } from '@casl/ability'
import { render } from '@/test/render.tsx'
import { rulesFor, type AppAbility } from '@/lib/ability'
import RouteError from '@/components/RouteError/RouteError'

describe('RouteError', () => {

  test('renders the access denied page when the ability said no', () => {
    const ability = createMongoAbility<AppAbility>(rulesFor('office'))
    const error = ForbiddenError.from(ability).unlessCan('read', 'ServiceTemplate')!

    render(<RouteError error={ error } reset={() => {}} />)

    expect(screen.getByText('Acceso no permitido')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Volver/ })).toBeInTheDocument()
  })

  test('renders the router error otherwise', () => {
    render(<RouteError error={ new Error('Boom') } reset={() => {}} />)

    expect(screen.queryByText('Acceso no permitido')).not.toBeInTheDocument()
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()
  })
})
