import type { ServiceTemplate } from '@/features/serviceTemplates/types'
import { useServiceTemplateMutations } from '@/features/serviceTemplates/useServiceTemplates'
import { config } from '@/features/serviceTemplates/data/serviceTemplate.form'
import CardForm from '@/components/Form/CardForm'
import type { FormCallbacks } from '@/components/Form/Form'

type ServiceTemplateFormProps = FormCallbacks & {
  serviceTemplate: Partial<ServiceTemplate> | null
}

const ServiceTemplateForm = ({ serviceTemplate, onCreate, onUpdate, onCancel }: ServiceTemplateFormProps) => {
  return (
    <CardForm
      name='serviceTemplate'
      itemName='Plantilla de servicio'
      config={ config }
      item={serviceTemplate}
      mutations={useServiceTemplateMutations()}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onCancel={onCancel}
    />
  )
}

export default ServiceTemplateForm