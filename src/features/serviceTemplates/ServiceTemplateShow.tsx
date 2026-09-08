import { useQuery } from '@tanstack/react-query'
import api from './data/serviceTemplates.service.ts'
import type { ServiceTemplate } from '@/features/serviceTemplates/types.ts'
import ServiceTemplateItem from '@/features/serviceTemplates/ServiceTemplateItem.tsx'

const ServiceTemplateShow = ({ id }: { id?: any }) => {

  const { data: template = null } = useQuery<ServiceTemplate | null>({
    queryKey: [ 'serviceTemplate', id ],
    queryFn: () => api.get(id)
  })

  return <ServiceTemplateItem template={template} />
}

export default ServiceTemplateShow