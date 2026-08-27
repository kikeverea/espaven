import { useInquiries, useInquiryMutations } from '@/features/inquiries/useInquiries'
import type { TableColumn } from '@/components/Table/types'
import type { Inquiry, FormInquiry } from '@/features/inquiries/types.ts'
import { timeString } from '@/lib/strings'
import Table from '@/components/Table/Table'
import { statusBadge } from '@/features/inquiries/util'
import { Pencil, Trash } from 'lucide-react'
import { useState } from 'react'
import DetailsTray from '@/features/inquiries/DetailsTray.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Plus, X } from 'lucide-react'
import InquiryForm from '@/features/inquiries/InquiryForm.tsx'
import NavBar from '@/components/NavBar/NavBar.tsx'
import { toast } from '@/components/ui/toast.tsx'

const InquiriesIndex = () => {

  const { inquiries = [] } = useInquiries()
  const { remove, removeAll } = useInquiryMutations()

  const [formInquiry, setFormInquiry] = useState<FormInquiry | Inquiry | null>(null)
  const [selectedInquiryId, setSelectedInquiryId] = useState<Inquiry['id']|null>(null)

  const columns: TableColumn<Inquiry>[] = [
    { name: 'Nombre',
      accessor: inquiry => `${inquiry.contact.name} ${inquiry.contact.lastName}`,
      blink: inquiry => !inquiry.lastActivityAt,
      onClick: id => setSelectedInquiryId(selectedInquiryId === id ? null : id)
    },
    { name: 'Servicio', accessor: 'service' },
    { name: 'Estado', accessor: 'status', presenter: statusBadge },
    { name: 'Última actividad', accessor: 'lastActivityAt', presenter: timeString },
    { name: 'Registrado', accessor: 'createdAt', presenter: timeString },
  ]

  const removeInquiry = (id: Inquiry['id']) => {
    const inquiry = findInquiry(id)

    if (inquiry)
      remove(inquiry, { onSuccess: () => {
        if (selectedInquiryId === id)
          setSelectedInquiryId(null)

        toast.add({ title: 'Solicitud descartada' })
      }})
  }
  const findInquiry = (id: Inquiry['id']) => inquiries.find(inq => inq.id === id ) || null
  const selectedInquiry = selectedInquiryId ? findInquiry(selectedInquiryId) : null

  return (
    <>
      <div className='flex w-full h-full'>
        <div className='min-w-0 flex-1 px-5 pb-8'>
          <NavBar
            label='Solicitudes'
            action={!formInquiry
              ? <Button
                  variant='primary'
                  className='me-2 px-4 py-4'
                  onClick={() => setFormInquiry({} as FormInquiry)}
                >
                  <Plus className='size-4' /> Nueva solicitud
                </Button>
              : <Button className='me-2 text-[13px] py-4' onClick={() => setFormInquiry(null) }>
                  <X className='size-4' /> Cerrar
                </Button>
            }
          />

          <InquiryForm inquiry={ formInquiry } onCancel={ () => setFormInquiry(null)}/>
          <div className='py-3 flex-1'>
            <Table
              collection={ inquiries }
              columns={ columns }
              noEntriesMessage='No hay solicitudes'
              selectable={ true }
              selectedId={ selectedInquiryId }
              blink={ inquiry => !inquiry.lastActivityAt }
              actions={[
                { label: "Editar", icon: <Pencil />, action: item => setFormInquiry(findInquiry(item.id)) },
                { label: "Eliminar", icon: <Trash />, action: item => removeInquiry(item.id), destructive: true },
              ]}
              selectionActions={removeAll
                ? [{
                    icon: <Trash className='size-4'/>,
                    mutation: removeAll,
                    variant: 'destructive',
                    onSuccess: () => toast.add({ title: 'Solicitudes eliminadas' })
                  }]
                : []
              }
            />
          </div>
        </div>
        <DetailsTray inquiry={ selectedInquiry } closeTray={() => setSelectedInquiryId(null) }/>
      </div>
    </>
  )
}

export default InquiriesIndex