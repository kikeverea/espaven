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
  selectionActions
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
          <TableHead key='select' className={`ps-5 max-w-8 w-8 xl:max-w-6.25 xl:w-w-6.25`}>
            <Checkbox
              onCheckedChange={ selectionChange }
              checked={ selected }
              className='data-checked:bg-blue-500 data-checked:border-blue-500 cursor-pointer'
            />
          </TableHead>
        }
        { columns.map(col =>
          <TableHead
            key={ col.name || col.key }
            className={`w-25 text-gray-500 cursor-pointer ${cellPadding()}`}
            onClick={ () => setSortColumn(normalized(col.name)) }
          >
            <div className="flex items-center gap-1">
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

        <TableHead>
          { selection?.length
            ? selectionActions?.map((action, ind) => (
              <Button
                key={ind}
                variant={action.variant}
                onClick={() => selection && action.mutation(selection, { onSuccess: action.onSuccess })}
              >
                { action.icon }
              </Button>
            ))
            : null
          }
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}

export default SortingHeader