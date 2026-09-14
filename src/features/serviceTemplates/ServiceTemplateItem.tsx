import type { ServiceTemplate } from '@/features/serviceTemplates/types.ts'
import PieChart from '@/components/PieChart/PieChart'

const ServiceTemplateItem = ({ template = {} }: { template?: Partial<ServiceTemplate> | null}) => {

  if (template === null)
    return <div>No se ha encontrado la plantilla</div>

  return (
    <div className='flex flex-col xl:flex-row gap-4 p-4'>
      <div className='xl:flex-1'>
        Content here...
      </div>
      <div className='xl:flex-1'>
        <PieChart />
      </div>
    </div>
  )
}

export default ServiceTemplateItem