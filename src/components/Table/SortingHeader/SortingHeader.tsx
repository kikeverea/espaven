import { TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'

import { ChevronUp } from 'lucide-react'
import type { Entity } from '@/types.ts'
import type { SelectionAction, TableColumn, TableSort } from '@/components/Table/types.ts'
import { normalized } from '@/lib/strings.ts'
import { cellPadding } from '@/components/Table/util.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'

type SortingHeaderProps<T extends Entity> = {
  sort?: TableSort,
  columns: TableColumn<T>[],
  setSortColumn: (name: string)=> void,
  selectable?: boolean
  selection?: T['id'][]
  hasActions: boolean
  onSelectedChange?: (selected: boolean) => void
  selectionActions?: SelectionAction<T>[]
}

const SortingHeader = <T extends Entity>({
  sort,
  columns,
  setSortColumn,
  selectable,
  selection,
  onSelectedChange,
  selectionActions,
  hasActions = !!selectionActions,
}: SortingHeaderProps<T>) => {

  const column = sort?.column
  const direction = sort?.direction || 'asc'
  const [selected, setSelected] = useState(false)

  const selectionChange = (selected: boolean): void => {
    setSelected(selected)
    onSelectedChange!(selected)
  }

  return (
    <TableHeader>
      <TableRow className='bg-gray-50'>
        { selectable &&
          // percentage-width columns are treated differently in the table auto layout leftover-space
          // redistribution step: they're excluded from getting extra space, unlike plain pixel-width columns
          <TableHead key='select' className={`w-[1%] ps-8 whitespace-nowrap`}>
            <Checkbox
              onCheckedChange={ selectionChange }
              checked={ selected }
              className='data-checked:bg-blue-500 data-checked:border-blue-500 cursor-pointer'
            />
          </TableHead>
        }
        { columns.map((col, ind) =>
          <TableHead
            key={ col.name || col.key }
            className={`
              w-25 text-gray-500 cursor-pointer
              ${cellPadding()}
              ${ind === columns.length - 1 && !hasActions ? 'pe-8' : ''}
            `}
            onClick={ () => setSortColumn(normalized(col.name)) }
          >
            <div className={`flex items-center gap-1 ${col.headerClassName}`}>
              {('name' in col) ? col.name : col.header()}

              {column?.toLowerCase() === col.name?.toLowerCase() && (
                <ChevronUp
                  className={`
                    size-4
                    transition-transform
                    duration-200
                    ${direction === 'desc' ? 'rotate-180' : 'rotate-0'}
                  `}
                />
              )}
            </div>
          </TableHead>
        )}

        { hasActions &&
          <TableHead className='text-end pe-6'>
            {
              selectionActions?.map((action, ind) => (
                <Button
                  key={ind}
                  variant={action.variant}
                  className={selection?.length ? '' : 'invisible'}
                  onClick={() => selection && action.mutation(selection, { onSuccess: action.onSuccess })}
                >
                  { action.icon }
                </Button>
              ))
            }
          </TableHead>
        }
      </TableRow>
    </TableHeader>
  )
}

export default SortingHeader