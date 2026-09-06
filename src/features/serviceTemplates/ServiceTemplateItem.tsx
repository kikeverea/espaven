import type { ServiceTemplate } from '@/features/serviceTemplates/types.ts'
import PieChart from '@/components/PieChart/PieChart'

const ServiceTemplateItem = ({ template = {} }: { template?: Partial<ServiceTemplate> | null}) => {

  console.log(template)

  if (template === null)
    return <div>No se ha encontrado la plantilla</div>

  return (
    <div className='py-4'>
      <PieChart />
    </div>
  )
}

export default ServiceTemplateItem