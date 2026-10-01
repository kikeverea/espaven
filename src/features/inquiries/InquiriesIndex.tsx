import { useInquiries, useInquiryMutations } from '@/features/inquiries/useInquiries'
import type { TableColumn } from '@/components/Table/types'
import type { Inquiry } from '@/features/inquiries/types.ts'
import { timeString } from '@/lib/strings'
import Table from '@/components/Table/Table'
import { statusBadge } from '@/features/inquiries/util'
import { Pencil, Trash } from 'lucide-react'
import DetailsTray from '@/features/inquiries/DetailsTray.tsx'
import InquiryForm from '@/features/inquiries/InquiryForm.tsx'
import IndexNavBar from '@/components/NavBar/IndexNavBar.tsx'
import { useCollection } from '@/components/Table/useCollection.tsx'
import { batchDelete } from '@/components/Table/util.tsx'

const InquiriesIndex = () => {

  const { collection: inquiries = [], formItem, selectedItem, remove, removeAll } = useCollection(
    'Solicitud',
    useInquiries('active'),
    useInquiryMutations()
  )

  const columns: TableColumn<Inquiry>[] = [
    { name: 'Nombre',
      accessor: inquiry => `${inquiry.contact.name} ${inquiry.contact.lastName}`,
      blink: inquiry => !inquiry.lastActivityAt,
      onClick: id => selectedItem.set(selectedItem.id() === id ? null : id)
    },
    { name: 'Servicio', accessor: 'service' },
    { name: 'Estado', accessor: 'status', presenter: statusBadge },
    { name: 'Última actividad', accessor: 'lastActivityAt', presenter: timeString },
    { name: 'Registrado', accessor: 'createdAt', presenter: timeString },
  ]

  return (
    <>
      <div className='flex w-full h-full'>
        <div className='min-w-0 flex-1 px-5 pb-8'>
          <IndexNavBar label='Solicitudes' createLabel='Nueva solicitud' form={ formItem } />

          <InquiryForm
            inquiry={ formItem.get() }
            onUpdate={ () => formItem.set(null) }
            onCancel={ () => formItem.set(null) }
          />

          <div className='py-3 flex-1'>
            <Table
              collection={ inquiries }
              columns={ columns }
              noEntriesMessage='No hay solicitudes'
              selectable={ true }
              selectedId={ selectedItem.id() }
              blink={ inquiry => !inquiry.lastActivityAt }
              actions={[
                { label: "Editar", icon: <Pencil />, action: itemId => formItem.set(itemId) },
                { label: "Eliminar", icon: <Trash />, action: itemId => remove(itemId), destructive: true },
              ]}
              selectionActions={ removeAll ? [ batchDelete<Inquiry>(removeAll, 'Solicitudes eliminadas') ] : []}
            />
          </div>
        </div>
        <DetailsTray inquiry={ selectedItem.get() } closeTray={() => selectedItem.set(null) }/>
      </div>
    </>
  )
}

export default InquiriesIndex