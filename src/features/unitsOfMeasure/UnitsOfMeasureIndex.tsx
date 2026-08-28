import { useState } from 'react'
import { useUnitsOfMeasure, useUnitsOfMeasureMutations } from '@/features/unitsOfMeasure/useUnitsOfMeasure'
import type { UnitOfMeasure, FormUnitOfMeasure } from '@/features/unitsOfMeasure/types'
import UnitOfMeasureForm from '@/features/unitsOfMeasure/UnitOfMeasureForm'
import type { TableColumn } from '@/components/Table/types'
import Table from '@/components/Table/Table'
import { Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Plus, X } from 'lucide-react'
import NavBar from '@/components/NavBar/NavBar.tsx'
import { toast } from '@/components/ui/toast.tsx'
import { findById } from '@/lib/utils.ts'

const UnitsOfMeasureIndex = () => {

  const { unitsOfMeasure = [] } = useUnitsOfMeasure()
  const { remove, removeAll } = useUnitsOfMeasureMutations()

  const [formUnitOfMeasure, setFormUnitOfMeasure] = useState<FormUnitOfMeasure | UnitOfMeasure | null>(null)

  const columns: TableColumn<UnitOfMeasure>[] = [
    { name: 'Unidad', accessor: 'name', className: 'font-medium' },
  ]

  const removeUnitOfMeasure = (id: UnitOfMeasure['id']) => {
    const unitOfMeasure = findById(unitsOfMeasure, id)
    if (unitOfMeasure) remove(unitOfMeasure, { onSuccess: () => toast.add({ title: 'unidad eliminada' }) })
  }

  const existingNames = unitsOfMeasure.map(unit => unit.name)

  return (
    <>
      <div className='flex w-full h-full'>
        <div className='min-w-0 flex-1 px-5 pb-8'>
          <NavBar
            label='Unidades de medida'
            action={!formUnitOfMeasure
              ? <Button
                variant='primary'
                className='me-2 px-4 py-4 lg:hidden'
                onClick={() => setFormUnitOfMeasure({} as FormUnitOfMeasure)}
              >
                <Plus className='size-4' /> Crear unidad
              </Button>
              : <Button className='me-2 text-[13px] py-4 lg:hidden' onClick={() => setFormUnitOfMeasure(null) }>
                <X className='size-4' /> Cerrar
              </Button>
            }
          />

          <UnitOfMeasureForm
            name="mobile-um"
            className="grid lg:hidden"
            unit={formUnitOfMeasure} onCancel={() => setFormUnitOfMeasure(null)}
            existingNames={ existingNames }
          />

          <div className='py-3 flex-1 flex gap-6 my-4 items-start'>
            <Table
              className='flex-1'
              collection={ unitsOfMeasure }
              columns={ columns }
              noEntriesMessage='No hay unidades'
              selectable={ true }
              actions={[
                { label: "Editar", icon: <Pencil />, action: unitOfMeasure => setFormUnitOfMeasure(findById(unitsOfMeasure, unitOfMeasure.id)) },
                { label: "Eliminar", icon: <Trash />, action: unitOfMeasure => removeUnitOfMeasure(unitOfMeasure.id), destructive: true },
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
            <UnitOfMeasureForm
              className="hidden lg:block lg:flex-1"
              name='desktop-um'
              unit={ formUnitOfMeasure || {}} onCancel={() => setFormUnitOfMeasure(null)}
              existingNames={ existingNames }
              />
          </div>
        </div>
      </div>
    </>
  )
}

export default UnitsOfMeasureIndex