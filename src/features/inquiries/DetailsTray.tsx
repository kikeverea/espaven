import type { Inquiry } from '@/features/inquiries/types.ts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ContactInfo from '@/features/inquiries/ContactInfo'
import InquiryInfo from '@/features/inquiries/InquiryInfo'
import { X } from 'lucide-react'
import { statusBadge } from '@/features/inquiries/util.tsx'
import InquiryComments from '@/features/inquiries/comments/InquiryComments.tsx'
import Avatar from '@/components/Avatar/Avatar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useInquiryMutations } from '@/features/inquiries/useInquiries.tsx'
import { toast } from '@/components/ui/toast.tsx'
import StatusDropdown from '@/features/inquiries/StatusDropdown.tsx'

type DetailsTrayProps = {
  inquiry: Inquiry | null,
  closeTray: () => void
}

const DetailsTray = ({ inquiry, closeTray }: DetailsTrayProps) => {

  const { remove } = useInquiryMutations()

  const handleRemove = (inquiry: Inquiry) => {
    remove(inquiry, { onSuccess: () => {
      closeTray()
      toast.add({ title: 'Solicitud descartada' })
    }})
  }

  return (
    <div className={`
      ${inquiry ? 'w-[415px] px-4 py-5 border shadow-xl' : 'w-0 p-0 border-0'}
      h-full bg-background
      absolute top-0 bottom-0 inset-e-0
      lg:static lg:inset-auto
      transition-[width] duration-200 ease-in-out`}
    >
      { inquiry &&
        <>
          <div className='flex gap-4 items-start'>
            <Avatar name={ inquiry.contact.name } size='lg' />
            <div className='flex-1'>
              <div className='font-semibold'>
                {`${inquiry.contact.name} ${inquiry.contact.lastName}` }
              </div>
              <div className='flex gap-2 items-center'>
                { statusBadge(inquiry.status) }
                <StatusDropdown inquiry={ inquiry }/>
              </div>
            </div>
            <button className='ps-2 pb-2 cursor-pointer' onClick={ closeTray }>
              <X className='text-gray-400 size-5'/>
            </button>
          </div>
          <div className='flex gap-4 mt-6 mb-2'>
            <Button className='flex-1' size='sm' variant='outlineSuccess'>
              Crear presupuesto
            </Button>
            <Button className='flex-1' size='sm' variant='outlineDestructive' onClick={ () => handleRemove(inquiry) }>
              Descartar
            </Button>
          </div>
          <div className='flex flex-col gap-4 pb-6'>
            <Card>
              <CardHeader>
                <CardTitle>Solicitud</CardTitle>
              </CardHeader>
              <CardContent className='text-sm'>
                <InquiryInfo inquiry={ inquiry } />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Información de contacto</CardTitle>
              </CardHeader>
              <CardContent className='text-sm'>
                <ContactInfo inquiry={ inquiry } />
              </CardContent>
            </Card>
          </div>
          <InquiryComments inquiry={ inquiry } />
        </>
      }
    </div>
  )
}

export default DetailsTray