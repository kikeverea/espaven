import type { FormCallbacks } from '@/components/Form/Form.tsx'
import type { InventoryItem, InventoryMovement } from '@/features/inventory/types.ts'
import type { TableColumn } from '@/components/Table/types.ts'
import { movementBadge } from '@/features/inventory/util.tsx'
import { timeString } from '@/lib/strings.ts'
import Table from '@/components/Table/Table.tsx'
import TableSkeleton from '@/components/Table/TableSkeleton.tsx'
import { useInventoryItemMovementMutations, useItemMovements } from '@/features/inventory/useItemMovements.tsx'
import { useTable } from '@/components/Table/useTable.tsx'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils.ts'
import { ArrowDown, ArrowUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'

type MovementListProps = FormCallbacks & {
  item: InventoryItem | null
  hideList: () => void
}

const List = ({ item }: { item: InventoryItem } ) => {
  const { collection: movements = [], isLoading } =
    useTable(useItemMovements(item), useInventoryItemMovementMutations(item))

  const columns: TableColumn<InventoryMovement>[] = [
    { name: 'Movimiento', accessor: 'movement', presenter: movementBadge },
    { name: 'Cantidad',
      accessor: 'amountDelta',
      className: 'text-center',
      headerClassName: 'justify-center',
      presenter: amount => amountPresenter(amount, item),
    },
    { name: 'En inventario',
      accessor: 'stockAfter',
      className: 'text-center',
      headerClassName: 'justify-center',
      presenter: (stock, movement) => stockPresenter(stock, item, movement.movement),
    },
    { name: 'Fecha',
      accessor: 'createdAt',
      presenter: timeString,
      className: 'text-end pe-10',
      headerClassName: 'justify-end pe-10'
    }
  ]

  return isLoading
    ? <TableSkeleton colCount={ columns.length } />
    : <Table
        collection={ movements }
        columns={ columns }
        noEntriesMessage='No hay movimientos'
      />
}

const MovementList = ({ item, hideList}: MovementListProps) => {

  return (
    <div className={
      `grid transition-[grid-template-rows] duration-300
      ${item ? 'grid-rows-[1fr] mb-8' : 'grid-rows-[0fr]'}`
    }>
      <div className={`min-h-0 overflow-hidden ${item ? 'pt-4' : 'm-0 py-0 ring-0'}`}>
        { item
          ? <>
              <div className='flex justify-between items-center mb-2 mx-1'>
                <h4 className='font-semibold text-sm'>
                  Últimos movimientos <span className='px-1'>–</span> {item.name}
                </h4>
                <Button variant='link' className='text-[13px]' onClick={ hideList }>
                  Cerrar movimientos <X size={ 6 }/>
                </Button>
              </div>
              <List item={ item } />
            </>
          : <TableSkeleton colCount={ 4 } />
        }
      </div>
    </div>
  )
}

function amountPresenter(amount: number, item: InventoryItem): ReactNode {
  const color = amount >= 0 ? 'text-green-500' : 'text-red-500'

  return (
    <span className={cn(color, 'font-semibold')}>
      {amount}
      <span className='ps-0.5'>{item.unitOfMeasure.name}</span>
    </span>
  )
}

function stockPresenter(stock: number, item: InventoryItem, movement: InventoryMovement['movement']): ReactNode {
  const icon = movement === 'in'
    ? <ArrowUp size={ 12 } className='text-green-500'/>
    : <ArrowDown size={ 12 } className='text-red-500' />

  return (
    <div className='flex gap-0.5 items-center justify-center'>
      { icon }
      { stock }
      <span>{item.unitOfMeasure.name}</span>
    </div>
  )
}

export default MovementList