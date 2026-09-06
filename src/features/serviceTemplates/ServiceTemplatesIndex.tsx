import { useServiceTemplates, useServiceTemplateMutations } from '@/features/serviceTemplates/useServiceTemplates'
import type { ServiceTemplate } from '@/features/serviceTemplates/types'
import type { TableColumn } from '@/components/Table/types'
import Table from '@/components/Table/Table'
import { Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import NavBar from '@/components/NavBar/NavBar'
import { toast } from '@/components/ui/toast'
import { toDecimal } from '@/lib/numbers.ts'
import { useCollection } from '@/components/Table/useCollection.tsx'
import ServiceTemplateForm from '@/features/serviceTemplates/ServiceTemplateForm.tsx'
import { timeString } from '@/lib/strings.ts'
import { Link } from '@tanstack/react-router'

const InventoryIndex = () => {

  const {
    collection: serviceTemplates = [],
    formItem,
    selectedItem,
    remove,
    removeAll
  } = useCollection(useServiceTemplates('active'), useServiceTemplateMutations())

  const columns: TableColumn<ServiceTemplate>[] = [
    { name: 'Nombre',
      accessor: 'name',
      link: id => `service_templates/${id}`
    },
    { name: 'Horas de trabajo', accessor: (template) => template.expectedMinutes / 60 },
    { name: 'Precio Total', accessor: (template) => `${toDecimal(template.priceCents)}€` },
    { name: 'Creada', accessor: 'createdAt', presenter: timeString },
  ]

  return (
    <>
      <div className='flex w-full h-full'>
        <div className='min-w-0 flex-1 px-5 pb-8'>
          <NavBar
            label='Plantillas de servicio'
            action={formItem.id() == null
              ? <Link to='/service_templates/new' className='me-2 px-4 py-4'>
                  {({ isActive }) => (
                    <Button variant={isActive ? 'default' : 'primary'} className='me-2 px-4 py-4'>
                      <Plus className='size-4' /> Crear plantilla
                    </Button>
                  )}
                </Link>
              : <Button className='me-2 text-[13px] py-4' onClick={() => formItem.set(null) }>
                  <X className='size-4' /> Cerrar
                </Button>
            }
          />
          <ServiceTemplateForm
            serviceTemplate={ formItem.get() }
            onUpdate={ () => formItem.set(null)}
            onCancel={ () => formItem.set(null)}
          />

          <div className='py-3 flex-1'>
            <Table
              collection={ serviceTemplates }
              columns={ columns }
              noEntriesMessage='No hay plantillas'
              selectable={ true }
              selectedId={ selectedItem.id() }
              actions={[
                { label: "Editar", icon: <Pencil />, action: itemId => formItem.set(itemId) },
                { label: "Eliminar", icon: <Trash />, action: itemId => remove(itemId), destructive: true },
              ]}
              selectionActions={removeAll
                ? [{
                  icon: <Trash className='size-4'/>,
                  mutation: removeAll,
                  variant: 'destructive',
                  onSuccess: () => toast.add({ title: 'Artículos eliminadas' })
                }]
                : []
              }
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default InventoryIndex