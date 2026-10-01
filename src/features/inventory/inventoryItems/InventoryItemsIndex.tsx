import { useInventoryItems, useInventoryItemMutations } from '@/features/inventory/inventoryItems/useInventoryItems.tsx'
import type { TableColumn } from '@/components/Table/types.ts'
import type { InventoryItem } from '@/features/inventory/inventoryItems/types.ts'
import Table from '@/components/Table/Table.tsx'
import { Pencil, Trash } from 'lucide-react'
import IndexNavBar from '@/components/NavBar/IndexNavBar.tsx'
import { useCollection } from '@/components/Table/useCollection.tsx'
import useTableQuery from '@/components/Table/hooks/useTableQuery.ts'
import InventoryItemForm from '@/features/inventory/inventoryItems/InventoryItemForm.tsx'
import { batchDelete } from '@/components/Table/util.tsx'

const InventoryItemsIndex = () => {
  const query = useTableQuery()

  const {
    collection: inventoryItems = [],
    server,
    formItem: formPart,
    isLoading,
    remove,
    removeAll
  } = useCollection(
    'Parte',
    useInventoryItems(query),
    useInventoryItemMutations(),
    query
  )


  const columns: TableColumn<InventoryItem>[] = [
    { name: 'Nombre', accessor: 'name', sortKey: 'name' },
    { name: 'Categoría', accessor: inventoryItem => inventoryItem.inventoryCategory.name, sortKey: 'category' }
  ]

  return (
    <>
      <div className='flex w-full h-full'>
        <div className='min-w-0 flex-1 px-5 pb-8'>
          <IndexNavBar label='Partes' createLabel='Crear parte' form={ formPart } className='xl:hidden' />

          <InventoryItemForm
            name='mobile-inventory-item'
            className="xl:hidden"
            inventoryItem={ formPart.get() || {}} onCancel={() => formPart.set(null)}
          />

          <div className='py-3 flex-1 flex gap-6 my-4 items-start'>
            <div className='lg:flex-1'>
              <Table
                collection={ inventoryItems }
                server={ server }
                isLoading={ isLoading }
                columns={ columns }
                noEntriesMessage='No hay partes'
                selectable={ true }
                actions={[
                  { label: "Editar", icon: <Pencil />, action: id => formPart.set(id) },
                  { label: "Eliminar", icon: <Trash />, action: id => remove(id), destructive: true },
                ]}
                selectionActions={ removeAll ? [ batchDelete<InventoryItem>(removeAll, 'Partes eliminadas') ] : []}
              />
            </div>
            <div className='lg:flex-1'>
              <InventoryItemForm
                name='desktop-inventory-item'
                className="hidden xl:block xl:flex-1"
                inventoryItem={ formPart.get() || {}} onCancel={() => formPart.set(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default InventoryItemsIndex