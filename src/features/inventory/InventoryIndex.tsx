import { useInventoryItems, useInventoryItemMutations } from '@/features/inventory/inventoryItems/useInventoryItems'
import type { InventoryItem } from '@/features/inventory/inventoryItems/types'
import InventoryItemForm from '@/features/inventory/inventoryItems/InventoryItemForm'
import InventoryItemTray from '@/features/inventory/InventoryItemTray'
import type { TableColumn } from '@/components/Table/types'
import Table from '@/components/Table/Table'
import { Pencil, Trash } from 'lucide-react'
import IndexNavBar from '@/components/NavBar/IndexNavBar.tsx'
import { toDecimal } from '@/lib/numbers.ts'
import { useCollection } from '@/components/Table/useCollection.tsx'
import MovementList from '@/features/inventory/movements/MovementList.tsx'
import SideTray from '@/components/SideTray/SideTray.tsx'
import { batchDelete } from '@/components/Table/util.tsx'
import useTableQuery from '@/components/Table/hooks/useTableQuery.ts'

const InventoryIndex = () => {
  const query = useTableQuery({ mode: 'server' })

  const {
    collection: inventory = [],
    pagination,
    isLoading,
    formItem,
    selectedItem,
    remove,
    removeAll
  } = useCollection(
    'Artículo',
    useInventoryItems({ query, staleTime: 3_000 }),
    useInventoryItemMutations()
  )

  const columns: TableColumn<InventoryItem>[] = [
    { name: 'Nombre',
      key: 'name',
      onClick: id => selectedItem.set(selectedItem.id() === id ? null : id)
    },
    { name: 'Stock', key: 'stock' },
    { name: 'Medida', key: 'unitOfMeasure', accessor: item => item.unitOfMeasure.name},
    { name: 'P. unidad', key: 'priceCents', presenter: cents => `${toDecimal(cents)}€` }
  ]

  const selected = selectedItem.get()

  return (
    <>
      <div className='flex w-full h-full'>
        <div className='min-w-0 flex-1 px-5 pb-8'>
          <IndexNavBar label='Inventario' createLabel='Crear artículo' form={ formItem } />

          <InventoryItemForm
            name='inventory-item-form'
            inventoryItem={ formItem.get() }
            onUpdate={ () => formItem.set(null)}
            onCancel={ () => formItem.set(null)}
          />

          <MovementList item={ selected } hideList={ () => selectedItem.set(null)} />

          <div className='py-3 flex-1'>
            <Table
              collection={ inventory }
              tableQuery={ query }
              pagination={ pagination }
              columns={ columns }
              isLoading={ isLoading }
              loadingMessage='Cargando articulos'
              noEntriesMessage='No hay artículos'
              selectable={ true }
              selectedId={ selectedItem.id() }
              actions={[
                { label: "Editar", icon: <Pencil />, action: itemId => formItem.set(itemId) },
                { label: "Eliminar", icon: <Trash />, action: itemId => remove(itemId), destructive: true },
              ]}
              selectionActions={ removeAll ? [ batchDelete<InventoryItem>(removeAll, 'Artículos eliminadas') ] : []}
            />
          </div>
        </div>

        <SideTray show={ !!selected }>
          { selected &&
            <InventoryItemTray item={ selected } closeTray={() => selectedItem.set(null) }/>
          }
        </SideTray>
      </div>
    </>
  )
}

export default InventoryIndex