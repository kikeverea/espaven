import { useInquiries } from '@/features/inquiries/useInquiries'
import type { TableColumn } from '@/components/Table/types'
import type { Inquiry, NewInquiry } from '@/features/types'
import { timeString } from '@/lib/strings'
import Table from '@/components/Table/Table'
import { statusBadge } from '@/features/inquiries/util'
import { Pencil, Trash } from 'lucide-react'
import { useState } from 'react'
import DetailsTray from '@/features/inquiries/DetailsTray.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Plus, X } from 'lucide-react'
import InquiryForm from '@/features/inquiries/InquiryForm/InquiryForm.tsx'
import NavBar from '@/components/NavBar/NavBar.tsx'


const InquiriesIndex = () => {

  const { inquiries = [] } = useInquiries()

  const [formInquiry, setFormInquiry] = useState<NewInquiry | Inquiry | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry|null>(null)

  const columns: TableColumn<Inquiry>[] = [
    { name: 'Nombre',
      accessor: inquiry => `${inquiry.contact.name} ${inquiry.contact.lastName}`,
      onClick: id => setSelectedInquiry(inquiries.find(inquiry => id === inquiry.id) || null),
    },
    { name: 'Servicio', accessor: 'service' },
    { name: 'Estado', accessor: 'status', presenter: statusBadge },
    { name: 'Última actividad', accessor: 'lastActivityAt', presenter: timeString },
    { name: 'Registrado', accessor: 'createdAt', presenter: timeString },
  ]

  return (
    <>
      <div className='flex w-full h-full pb-10'>
        <div className='min-w-0 flex-1 px-5'>
          <NavBar
            label='Solicitudes'
            action={!formInquiry
              ? <Button
                  variant='primary'
                  className='me-2 px-4 py-4'
                  onClick={() => setFormInquiry({})}
                >
                  <Plus className='size-4' /> Nueva solicitud
                </Button>
              : <Button className='me-2 text-[13px] py-4' onClick={() => setFormInquiry(null) }>
                  <X className='size-4' /> Cerrar
                </Button>
            }
          />

          { <InquiryForm inquiry={ formInquiry } onCancel={ () => setFormInquiry(null)}/> }
          <div className='py-3 flex-1'>
            <Table
              collection={ inquiries }
              columns={ columns }
              noEntriesMessage='No hay solicitudes'
              selectable={ true }
              selectedId={ selectedInquiry?.id }
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