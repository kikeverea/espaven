import { useVehicles, useVehicleMutations } from '@/features/vehicles/useVehicles'
import type { TableColumn } from '@/components/Table/types'
import type { Vehicle } from '@/features/vehicles/types.ts'
import Table from '@/components/Table/Table'
import { Pencil, Trash } from 'lucide-react'
import IndexNavBar from '@/components/NavBar/IndexNavBar.tsx'
import { useCollection } from '@/components/Table/useCollection.tsx'
import useTableQuery from '@/components/Table/hooks/useTableQuery.ts'
import { batchDelete } from '@/components/Table/util.tsx'
import VehicleForm from '@/features/vehicles/VehicleForm.tsx'

const VehiclesIndex = () => {
  const query = useTableQuery({ mode: 'server' })

  const {
    collection: vehicles = [],
    pagination,
    formItem: formVehicle,
    isLoading,
    remove,
    removeAll
  } = useCollection(
    [ 'Vehículo', 'm' ],
    useVehicles(query),
    useVehicleMutations(),
  )

  // TODO: check the columns. `key`, snake cased, is what the api calls the column
  const columns: TableColumn<Vehicle>[] = [
    { name: 'Matrícula', key: 'plateNumber' },
    { name: 'Marca', key: 'make' },
    { name: 'Modelo', key: 'model' },
    { name: 'Cilindrada', key: 'engineSize' },
    { name: 'Variación', key: 'variation' },
    { name: 'Tipo de variante', key: 'variantType' },
    { name: 'Tipo de vehículo', key: 'vehicleType' },
    { name: 'Plazas', key: 'seats' },
    { name: 'Combustible', key: 'fuel' },
    { name: 'Puertas', key: 'doors' },
    { name: 'Potencia', key: 'dynamicPower' },
    { name: 'K-Type', key: 'kType' },
    { name: 'Precio orientativo', key: 'indicativePrice' },
    { name: 'Robado', key: 'stolen' },
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
              tableQuery={ query }
              pagination={ pagination }
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
