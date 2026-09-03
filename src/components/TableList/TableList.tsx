import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import type { ComponentProps, ReactNode } from 'react'

export type TableListEntry = [ReactNode, ReactNode, ...ReactNode[]]

type TableListProps = ComponentProps<'table'> & {
  entries: TableListEntry[]
}

const TableList = ({ entries, className }: TableListProps) => {

  return (
    <Table className={`text-[13px] px-0 ${className}`}>
      <TableBody>
        { entries.map((entry, ind) =>
          <TableRow key={`${entry[0]}-${ind}`} className='border-b-0'>
            { entry.map((value, ind) =>
              <TableCell key={`${entry}-${value}-${ind}`} className={`ps-1 pe-2 ${ind === 0 ? 'text-muted-foreground' : ''}`}>
                { value }
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
export default TableList