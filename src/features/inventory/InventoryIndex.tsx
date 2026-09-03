import { useInventory, useInventoryItemMutations } from '@/features/inventory/useInventory'
import type { InventoryItem } from '@/features/inventory/types'
import InventoryItemForm from '@/features/inventory/InventoryItemForm'
import InventoryItemTray from '@/features/inventory/InventoryItemTray'
import type { TableColumn } from '@/components/Table/types'
import Table from '@/components/Table/Table'
import { Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import NavBar from '@/components/NavBar/NavBar'
import { toast } from '@/components/ui/toast'
import { toDecimal } from '@/lib/numbers.ts'
import { useTable } from '@/components/Table/useTable'
import MovementList from '@/features/inventory/movements/MovementList.tsx'
import SideTray from '@/components/SideTray/SideTray.tsx'

const InventoryIndex = () => {

  const { collection: inventory = [], formItem, selectedItem, remove, removeAll } =
    useTable(useInventory(), useInventoryItemMutations())

  const columns: TableColumn<InventoryItem>[] = [
    { name: 'Nombre',
      accessor: 'name',
      onClick: id => selectedItem.set(selectedItem.id() === id ? null : id)
    },
    { name: 'Stock', accessor: 'stock' },
    { name: 'Medida', accessor: item => item.unitOfMeasure.name },
    { name: 'P. unidad', accessor: 'priceCents', presenter: cents => `${toDecimal(cents)}€` }
  ]

  const selected = selectedItem.get()

  return (
    <>
      <div className='flex w-full h-full'>
        <div className='min-w-0 flex-1 px-5 pb-8'>
          <NavBar
            label='Inventario'
            action={formItem.id() == null
              ? <Button
                variant='primary'
                className='me-2 px-4 py-4'
                onClick={() => formItem.set({} as InventoryItem)}
              >
                <Plus className='size-4' /> Crear artículo
              </Button>
              : <Button className='me-2 text-[13px] py-4' onClick={() => formItem.set(null) }>
                <X className='size-4' /> Cerrar
              </Button>
            }
          />

          <InventoryItemForm
            item={ formItem.get() }
            onUpdate={ () => formItem.set(null)}
            onCancel={ () => formItem.set(null)}
          />

          <MovementList item={ selected } hideList={ () => selectedItem.set(null)} />

          <div className='py-3 flex-1'>
            <Table
              collection={ inventory }
              columns={ columns }
              noEntriesMessage='No hay artículos'
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