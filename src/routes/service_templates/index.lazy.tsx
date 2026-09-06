import { createLazyFileRoute } from '@tanstack/react-router'
import ServiceTemplatesIndex from '@/features/serviceTemplates/ServiceTemplatesIndex'

export const Route = createLazyFileRoute('/service_templates/')({
  component: () => <ServiceTemplatesIndex />
})