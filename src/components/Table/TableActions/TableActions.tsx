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
          <DropdownMenuItem className='p-0'>
            <Link to={ action.path(item) } className='flex gap-2 px-2 py-2 w-full'>
              { action.icon }
              <span className='text-xs'>{ action.label }</span>
            </Link>
          </DropdownMenuItem>
        )}
        { !!destructive.length && <DropdownMenuSeparator /> }
        { destructive.map(action =>
          <DropdownMenuItem variant='destructive' className='p-0'>
            <Link to={ action.path(item) } className='flex gap-2 px-2 py-2 w-full'>
              { action.icon }
              <span className='text-xs'>{ action.label }</span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
