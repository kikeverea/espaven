import { ErrorComponent, type ErrorComponentProps } from '@tanstack/react-router'
import { ForbiddenError } from '@casl/ability'
import AccessDenied from '@/components/AccessDenied/AccessDenied.tsx'

/* The routes' error component: a page of its own when the ability said no, the router's otherwise */
const RouteError = (props: ErrorComponentProps) =>
  props.error instanceof ForbiddenError
    ? <AccessDenied />
    : <ErrorComponent { ...props } />

export default RouteError
