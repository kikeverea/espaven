import { useSuppliers, useSupplierMutations } from '@/features/suppliers/useSuppliers'
import type { TableColumn } from '@/components/Table/types'
import type { Supplier } from '@/features/suppliers/types.ts'
import Table from '@/components/Table/Table'
import { Pencil, Trash } from 'lucide-react'
import IndexNavBar from '@/components/NavBar/IndexNavBar.tsx'
import { useCollection } from '@/components/Table/useCollection.tsx'
import { batchDelete } from '@/components/Table/util.tsx'
import SupplierForm from '@/features/suppliers/SupplierForm.tsx'

const SuppliersIndex = () => {
  const {
    collection: suppliers = [],
    formItem: formSupplier,
    isLoading,
    remove,
    removeAll
  } = useCollection(
    [ 'Proveedor', 'm' ],
    useSuppliers(),
    useSupplierMutations(),
  )

  const columns: TableColumn<Supplier>[] = [
    { name: 'Nombre', key: 'name' },
    { name: 'Ciudad', key: 'city', accessor: supplier => supplier.city ?? '' },
    { name: 'Teléfono', key: 'phone', accessor: supplier => supplier.phone ?? '' },
    { name: 'Email', key: 'email', accessor: supplier => supplier.email ?? '' },
  ]

  return (
    <div className='flex w-full h-full'>
      <div className='min-w-0 flex-1 px-5 pb-8'>
        <IndexNavBar label='Proveedores' createLabel='Crear proveedor' form={ formSupplier } className='xl:hidden' />

        <SupplierForm
          name='mobile-supplier'
          className='xl:hidden'
          supplier={ formSupplier.get() || {} }
          onCancel={() => formSupplier.set(null)}
        />

        <div className='py-3 flex-1 flex gap-6 my-4 items-start'>
          <div className='lg:flex-1'>
            <Table
              collection={ suppliers }
              isLoading={ isLoading }
              columns={ columns }
              noEntriesMessage='No hay proveedores'
              selectable={ true }
              actions={[
                { label: 'Editar', icon: <Pencil />, action: id => formSupplier.set(id) },
                { label: 'Eliminar', icon: <Trash />, action: id => remove(id), destructive: true },
              ]}
              selectionActions={removeAll
                ? [batchDelete<Supplier>(removeAll, 'Proveedores eliminados')]
                : []
              }
            />
          </div>
          <div className='lg:flex-1'>
            <SupplierForm
              name='desktop-supplier'
              className='hidden xl:block xl:flex-1'
              supplier={ formSupplier.get() || {} }
              onCancel={() => formSupplier.set(null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuppliersIndex
