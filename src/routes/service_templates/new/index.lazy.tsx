import { createLazyFileRoute } from '@tanstack/react-router'
import ServiceTemplateItem from '@/features/serviceTemplates/ServiceTemplateItem'

export const Route = createLazyFileRoute('/service_templates/new/')({
  component: ServiceTemplateItem,
})
