import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import type { Inquiry } from '@/features/inquiries/types.ts'
import { timeString } from '@/lib/strings'

const InquiryInfo = ({ inquiry }: { inquiry: Inquiry }) => {

  return (
    <Table className="text-[13px] px-0">
      <TableBody>
        <TableRow className='border-b-0'>
          <TableCell className='ps-1 pe-2 px-4 text-muted-foreground'>Servicio</TableCell>
          <TableCell className='ps-2 px-4'>{ inquiry.service }</TableCell>
        </TableRow>
        <TableRow className='border-b-0'>
          <TableCell className='ps-1 pe-2 px-4 text-muted-foreground'>Última actividad</TableCell>
          <TableCell className='ps-2 px-4'>
            { timeString(inquiry.lastActivityAt) }
          </TableCell>
        </TableRow>
        <TableRow className='border-b-0'>
          <TableCell className='ps-1 pe-2 px-4 text-muted-foreground'>Registrado</TableCell>
          <TableCell className='ps-2 px-4'>
            { timeString(inquiry.createdAt) }
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
export default InquiryInfo