import { TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'

import {
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import type { Entity } from '@/types.ts'
import type { TableColumn, TableSort } from '@/components/Table/types.ts'
import { normalized } from '@/lib/strings.ts'

type SortingHeaderProps<T extends Entity> = {
  sort?: TableSort,
  columns: TableColumn<T>[],
  setSortColumn: (name: string)=> void,
}

const SortingHeader = <T extends Entity>({ sort, columns, setSortColumn }: SortingHeaderProps<T>) => {

  const column = sort?.column
  const direction = sort?.direction || 'asc'

  return (
    <TableHeader>
      <TableRow>
        { columns.map(col =>
          <TableHead key={ col.name } className="w-25" onClick={ () => setSortColumn(normalized(col.name)) }>
            <div className="flex items-center gap-1">
              {col.name}

              {column === col.name && (
                direction === "asc"
                  ? <ChevronUp className="size-4" />
                  : <ChevronDown className="size-4" />
              )}
            </div>
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  )
}

export default SortingHeader