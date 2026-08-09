import useInquiries from '@/features/inquiries/useInquiries'
import type { TableColumn } from '@/components/Table/types'
import type { Inquiry } from '@/features/types'
import { timeString } from '@/lib/strings'
import Table from '@/components/Table/Table'
import { statusBadge } from '@/features/inquiries/util'
import { Pencil, Trash } from 'lucide-react'
import { useState } from 'react'
import DetailsTray from '@/features/inquiries/DetailsTray.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Plus } from 'lucide-react'


const InquiriesIndex = () => {

  const { inquiries = [] } = useInquiries()

  const [formInquiry, setFormInquiry] = useState<Partial<Inquiry>|null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry|null>(null)

  const columns: TableColumn<Inquiry>[] = [
    { name: 'Nombre',
      accessor: inquiry => `${inquiry.contact.name} ${inquiry.contact.lastName}`,
      onClick: id => setSelectedInquiry(inquiries.find(inquiry => id === inquiry.id) || null),
    },
    { name: 'Servicio', accessor: 'service' },
    { name: 'Estado', accessor: 'status', presenter: statusBadge},
    { name: 'Última actividad', accessor: 'lastActivity', presenter: timeString },
    { name: 'Registrada', accessor: 'created', presenter: timeString },
  ]

  return (
    <>
      <div className='flex w-full'>
        <div className='flex-1 px-5'>
          <nav className='w-full h-12.5 flex justify-between items-end bg-background'>
            <h1 className='text-2xl font-semibold ms-1 mt-2'>
              Solicitudes
            </h1>
            <Button
              className='bg-blue-600 hover:bg-blue-700 me-2 text-[13px] py-4 cursor-pointer'
              onClick={() => setFormInquiry({})}
            >
              <Plus className='size-4' /> Nueva solicitud
            </Button>
          </nav>
          { formInquiry && <InquiryForm inquiry={ formInquiry }/> }
          <div className='py-3'>
            <Table
              collection={ inquiries }
              columns={ columns }
              noEntriesMessage='No hay solicitudes'
              selectable={ true }
              actions={[
                { label: "Editar", icon: <Pencil />, path: (_item) => '/item' },
                { label: "Eliminar", icon: <Trash />, path: (_item) => '/item', destructive: true },
              ]}
            />
          </div>
        </div>
        <DetailsTray inquiry={ selectedInquiry } closeTray={() => setSelectedInquiry(null) }/>
      </div>
    </>
  )
}

export default InquiriesIndex