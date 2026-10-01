import { useVehicles, useVehicleMutations } from '@/features/vehicles/useVehicles'
import type { TableColumn } from '@/components/Table/types'
import type { Vehicle } from '@/features/vehicles/types.ts'
import Table from '@/components/Table/Table'
import { Pencil, Trash } from 'lucide-react'
import IndexNavBar from '@/components/NavBar/IndexNavBar.tsx'
import { useCollection } from '@/components/Table/useCollection.tsx'
import useTableQuery from '@/components/Table/hooks/useTableQuery'
import { batchDelete } from '@/components/Table/util.tsx'
import VehicleForm from '@/features/vehicles/VehicleForm.tsx'

const VehiclesIndex = () => {
  const query = useTableQuery()

  const {
    collection: vehicles = [],
    server,
    formItem: formVehicle,
    isLoading,
    remove,
    removeAll
  } = useCollection(
    [ 'Vehículo', 'm' ],
    useVehicles(query),
    useVehicleMutations(),
    query
  )

  // TODO: check the columns. `sortKey` is what the api calls the column
  const columns: TableColumn<Vehicle>[] = [
    { name: 'Matrícula', accessor: 'plateNumber', sortKey: 'plate_number' },
    { name: 'Marca', accessor: 'make', sortKey: 'make' },
    { name: 'Modelo', accessor: 'model', sortKey: 'model' },
    { name: 'Cilindrada', accessor: 'engineSize', sortKey: 'engine_size' },
    { name: 'Variación', accessor: 'variation', sortKey: 'variation' },
    { name: 'Tipo de variante', accessor: 'variantType', sortKey: 'variant_type' },
    { name: 'Tipo de vehículo', accessor: 'vehicleType', sortKey: 'vehicle_type' },
    { name: 'Plazas', accessor: 'seats', sortKey: 'seats' },
    { name: 'Combustible', accessor: 'fuel', sortKey: 'fuel' },
    { name: 'Puertas', accessor: 'doors', sortKey: 'doors' },
    { name: 'Potencia', accessor: 'dynamicPower', sortKey: 'dynamic_power' },
    { name: 'K-Type', accessor: 'kType', sortKey: 'k_type' },
    { name: 'Precio orientativo', accessor: 'indicativePrice', sortKey: 'indicative_price' },
    { name: 'Robado', accessor: 'stolen', sortKey: 'stolen' },
  ]

  return (
    <div className='flex w-full h-full'>
      <div className='min-w-0 flex-1 px-5 pb-8'>
        <IndexNavBar label='Vehículos' createLabel='Crear vehículo' form={ formVehicle } className='xl:hidden' />

        <VehicleForm
          name='mobile-vehicle'
          className='xl:hidden'
          vehicle={ formVehicle.get() || {} }
          onCancel={() => formVehicle.set(null)}
        />

        <div className='py-3 flex-1 flex gap-6 my-4 items-start'>
          <div className='lg:flex-1'>
            <Table
              collection={ vehicles }
              server={ server }
              isLoading={ isLoading }
              columns={ columns }
              noEntriesMessage='No hay vehículos'
              selectable={ true }
              actions={[
                { label: 'Editar', icon: <Pencil />, action: id => formVehicle.set(id) },
                { label: 'Eliminar', icon: <Trash />, action: id => remove(id), destructive: true },
              ]}
              selectionActions={removeAll
                ? [batchDelete<Vehicle>(removeAll, 'Vehículos eliminados')]
                : []
              }
            />
          </div>
          <div className='lg:flex-1'>
            <VehicleForm
              name='desktop-vehicle'
              className='hidden xl:block xl:flex-1'
              vehicle={ formVehicle.get() || {} }
              onCancel={() => formVehicle.set(null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehiclesIndex
