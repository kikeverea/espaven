import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table.tsx'
import type { Inquiry } from '@/features/inquiries/types.ts'

const ContactInfo = ({ inquiry }: { inquiry: Inquiry }) => {

  const contact = inquiry.contact

  return (
    <Table className='text-[13px] text-gray-800'>
      <TableBody>
        <TableRow className='border-b-0'>
          <TableCell className='w-36 ps-1 pe-2 px-4 text-muted-foreground'>Nombre</TableCell>
          <TableCell className='ps-2 px-4'>{ `${contact.name} ${contact.lastName}` }</TableCell>
        </TableRow>
        <TableRow className='border-b-0'>
          <TableCell className='w-36 ps-1 pe-2 px-4 text-muted-foreground'>Teléfonos</TableCell>
          <TableCell className='ps-2 px-4'>
            { contact.phoneNumbers?.map(({ number }, ind) =>
              <div key={`${number}-${ind}`} className='py-1'>{ number }</div>)
            }
          </TableCell>
        </TableRow>
        <TableRow className='border-b-0'>
          <TableCell className='w-36 ps-1 pe-2 px-4 text-muted-foreground'>Emails</TableCell>
          <TableCell className='ps-2 px-4'>
            { contact.emails?.map(({ address }, ind) =>
              <div key={`${address}-${ind}`} className='py-1'>{ address }</div>)
            }
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
export default ContactInfo