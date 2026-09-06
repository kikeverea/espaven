import { createLazyFileRoute } from '@tanstack/react-router'
import ServiceTemplateShow from '@/features/serviceTemplates/ServiceTemplateShow'

export const Route = createLazyFileRoute('/service_templates/$id/')({
  component: ServiceTemplateRoute,
})

function ServiceTemplateRoute() {
  const { id } = Route.useParams()

  return <ServiceTemplateShow id={id} />
}