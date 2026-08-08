import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type JSX } from 'react'
import type { RowData, TableAction } from '@/components/Table/types.ts'
import type { Dictionary } from '@/types.ts'

import { EllipsisVertical } from 'lucide-react'
import { Link } from '@tanstack/react-router'

type TableActionsProps = {
  actions: TableAction[],
  item: RowData
}

export function TableActions({ actions = [], item }: TableActionsProps): JSX.Element {

  const { regular, destructive } = actions.reduce((result, action) => {
    if (action.destructive) result.destructive.push(action)
    else result.regular.push(action)

    return result
  }, { regular: [], destructive: [] } as Dictionary<TableAction[]>)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" aria-label="Acciones"/>
      }>
        <EllipsisVertical className="size-4 text-gray-600" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        { regular.map(action =>
          <DropdownMenuItem>
            { action.icon }
            <Link to={ action.path(item) }>
              <span className='text-xs'>{ action.label }</span>
            </Link>
          </DropdownMenuItem>
        )}
        { !!destructive.length && <DropdownMenuSeparator /> }
        { destructive.map(action =>
          <DropdownMenuItem variant='destructive'>
            { action.icon }
            <Link to={ action.path(item) }>
              <span className='text-xs'>{ action.label }</span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
