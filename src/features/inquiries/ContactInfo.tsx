import type { Inquiry } from '@/features/inquiries/types.ts'
import TableList from '@/components/TableList/TableList.tsx'

const ContactInfo = ({ inquiry }: { inquiry: Inquiry }) => {

  const contact = inquiry.contact

  const emails =
    contact.emails?.map(({ address }, ind) => <div key={`${address}-${ind}`} className='py-1'>{ address }</div>)

  const phoneNumbers =
    contact.phoneNumbers?.map(({ number }, ind) => <div key={`${number}-${ind}`} className='py-1'>{ number }</div>)

  return (
    <TableList entries={[
      [ 'Nombre', `${contact.name} ${contact.lastName}` ],
      [ 'Teléfonos', phoneNumbers ],
      [ 'Emails', emails ],
    ]} />
  )
}
export default ContactInfo