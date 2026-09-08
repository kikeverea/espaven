import { useGenericParts, useGenericPartMutations } from '@/features/genericParts/useGenericParts'
import type { TableColumn } from '@/components/Table/types'
import type { GenericPart } from '@/features/genericParts/types.ts'
import Table from '@/components/Table/Table'
import { Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Plus, X } from 'lucide-react'
import NavBar from '@/components/NavBar/NavBar.tsx'
import { toast } from '@/components/ui/toast.tsx'
import { useCollection } from '@/components/Table/useCollection.tsx'
import useTableQuery from '@/components/Table/hooks/useTableQuery'
import GenericPartForm from '@/features/genericParts/GenericPartForm.tsx'

const GenericPartsIndex = () => {
  const query = useTableQuery()

  const {
    collection: genericParts = [],
    server,
    formItem: formPart,
    isLoading,
    remove,
    removeAll
  } = useCollection(
    'Parte',
    useGenericParts(query),
    useGenericPartMutations(),
    query
  )


  const columns: TableColumn<GenericPart>[] = [
    { name: 'Nombre', accessor: 'name', sortKey: 'name' },
    { name: 'Categoría', accessor: genericPart => genericPart.inventoryCategory.name, sortKey: 'category' }
  ]

  return (
    <>
      <div className='flex w-full h-full'>
        <div className='min-w-0 flex-1 px-5 pb-8'>
          <NavBar
            label='Partes'
            action={!formPart.get()
              ? <Button
                variant='primary'
                className='me-2 px-4 py-4 lg:hidden'
                onClick={() => formPart.set({} as GenericPart)}
              >
                <Plus className='size-4' /> Crear parte
              </Button>
              : <Button className='me-2 text-[13px] py-4 lg:hidden' onClick={() => formPart.set(null) }>
                <X className='size-4' /> Cerrar
              </Button>
            }
          />

          <GenericPartForm
            name='mobile-generic-part'
            className="xl:hidden"
            genericPart={ formPart.get() || {}} onCancel={() => formPart.set(null)}
          />

          <div className='py-3 flex-1 flex gap-6 my-4 items-start'>
            <div className='lg:flex-1'>
              <Table
                collection={ genericParts }
                server={ server }
                isLoading={ isLoading }
                columns={ columns }
                noEntriesMessage='No hay partes'
                selectable={ true }
                actions={[
                  { label: "Editar", icon: <Pencil />, action: id => formPart.set(id) },
                  { label: "Eliminar", icon: <Trash />, action: id => remove(id), destructive: true },
                ]}
                selectionActions={removeAll
                  ? [{
                    icon: <Trash className='size-4'/>,
                    mutation: removeAll,
                    variant: 'destructive',
                    onSuccess: () => toast.add({ title: 'Unidades eliminadas' })
                  }]
                  : []
                }
              />
            </div>
            <div className='lg:flex-1'>
              <GenericPartForm
                name='desktop-generic-part'
                className="hidden xl:block xl:flex-1"
                genericPart={ formPart.get() || {}} onCancel={() => formPart.set(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GenericPartsIndex