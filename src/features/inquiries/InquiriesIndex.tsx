import useInquiries from '@/features/inquiries/useInquiries.tsx'
import type { TableColumn } from '@/components/Table/types.ts'
import type { Inquiry } from '@/features/types.ts'
import { timeString } from '@/lib/strings.ts'
import Table from '@/components/Table/Table.tsx'
import { type InquiryStatus, inquiryStatusStyle } from '@/features/inquiries/util.ts'
import { Badge } from '@/components/ui/badge.tsx'
import { useState } from 'react'
import { Pencil, Trash } from 'lucide-react'


const InquiriesIndex = () => {

  const { inquiries } = useInquiries()
  const [selected, setSelected] = useState<Inquiry['id'][]>([])

  const statusBadge = (status: InquiryStatus) => {
    const { label, className } = inquiryStatusStyle(status)

    return (
      <Badge variant="outline" className={className}>
        {label}
      </Badge>
    )
  }

  const columns: TableColumn<Inquiry>[] = [
    { name: 'Nombre', accessor: inquiry => `${inquiry.contact.name} ${inquiry.contact.lastName}` },
    { name: 'Servicio', accessor: 'service' },
    { name: 'Estado', accessor: 'status', presenter: statusBadge},
    { name: 'Última actividad', accessor: 'lastActivity', presenter: timeString },
    { name: 'Registrada', accessor: 'created', presenter: timeString },
  ]

  return (
    <div className='rounded-lg border'>
      <Table
        collection={ inquiries }
        columns={ columns }
        noEntriesMessage='No hay solicitudes'
        selectable={ true }
        onSelectionChange={ setSelected }
        actions={[
          { label: "Editar", icon: <Pencil />, path: (_item) => '/item' },
          { label: "Eliminar", icon: <Trash />, path: (_item) => '/item', destructive: true },
        ]}
      />
    </div>
  )
}

export default InquiriesIndex