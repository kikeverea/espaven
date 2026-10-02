import { ErrorComponent, type ErrorComponentProps } from '@tanstack/react-router'
import { ForbiddenError } from '@casl/ability'
import AccessDenied from '@/components/AccessDenied/AccessDenied.tsx'

const RouteError = (props: ErrorComponentProps) =>
  props.error instanceof ForbiddenError
    ? <AccessDenied />
    : <ErrorComponent { ...props } />

export default RouteError
