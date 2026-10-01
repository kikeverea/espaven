import { useInventoryCategories, useInventoryCategoryMutations } from '@/features/inventoryCategories/useInventoryCategories'
import type { TableColumn } from '@/components/Table/types'
import type { InventoryCategory } from '@/features/inventoryCategories/types.ts'
import Table from '@/components/Table/Table'
import { Pencil, Trash } from 'lucide-react'
import IndexNavBar from '@/components/NavBar/IndexNavBar.tsx'
import { useCollection } from '@/components/Table/useCollection.tsx'
import InventoryCategoryForm from '@/features/inventoryCategories/InventoryCategoryForm.tsx'
import BooleanBadge from '@/components/BooleanBadge/BooleanBadge.tsx'
import { batchDelete } from '@/components/Table/util.tsx'

const InventoryCategoriesIndex = () => {

  const {
    collection: inventoryCategories = [],
    formItem: formCategory,
    remove,
    removeAll
  } = useCollection(
    'Categoría',
    useInventoryCategories(),
    useInventoryCategoryMutations()
  )

  const columns: TableColumn<InventoryCategory>[] = [
    { name: 'Nombre', accessor: 'name' },
    { name: 'SIGAUS',
      accessor: 'appliesSigaus',
      presenter: applies => <BooleanBadge
        bool={applies === 'true'}
        trueColor='bg-orange-50 text-orange-500 border-orange-300'
        falseColor='bg-gray-50 text-gray-500 border-gray-300'
      />
    }
  ]

  return (
    <>
      <div className='flex w-full h-full'>
        <div className='min-w-0 flex-1 px-5 pb-8'>
          <IndexNavBar label='Categorías de inventario' createLabel='Crear categoría' form={ formCategory } className='xl:hidden' />

          <div className='py-3 flex-1 flex gap-6 my-4 items-start'>
            <div className='lg:flex-1'>
              <Table
                collection={ inventoryCategories }
                columns={ columns }
                noEntriesMessage='No hay categorías'
                selectable={ true }
                actions={[
                  { label: "Editar", icon: <Pencil />, action: id => formCategory.set(id) },
                  { label: "Eliminar", icon: <Trash />, action: id => remove(id), destructive: true },
                ]}
                selectionActions={ removeAll ? [ batchDelete<InventoryCategory>(removeAll, 'Categorías eliminadas') ] : []}
              />
            </div>
            <div className='lg:flex-1'>
              <InventoryCategoryForm
                className="hidden lg:block lg:flex-1"
                inventoryCategory={ formCategory.get() || {} }
                onCancel={ () => formCategory.set(null) }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default InventoryCategoriesIndex