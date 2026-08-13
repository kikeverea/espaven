import type { Inquiry } from '@/features/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ContactInfo from '@/features/inquiries/ContactInfo'
import InquiryInfo from '@/features/inquiries/InquiryInfo'
import { X } from 'lucide-react'
import { statusBadge } from '@/features/inquiries/util.tsx'

type DetailsTrayProps = {
  inquiry: Inquiry | null,
  closeTray: () => void
}

const DetailsTray = ({ inquiry, closeTray }: DetailsTrayProps) => {
  return (
    <div className={`
      ${inquiry ? 'w-[415px] px-4 py-5 border shadow-xl' : 'w-0 p-0 border-0'}
      h-screen bg-background
      absolute top-0 bottom-0 inset-e-0
      lg:static lg:inset-auto
      transition-[width] duration-200 ease-in-out`}
    >
      { inquiry &&
        <>
          <div className='flex gap-4 items-start'>
            <div className='w-13.5 h-13.5 rounded-lg border grid place-content-center bg-purple-600 text-white text-2xl font-semibold'>
              G
            </div>
            <div className='flex-1'>
              <div className='font-semibold mb-1'>
                {`${inquiry.contact.name} ${inquiry.contact.lastName}` }
              </div>
              { statusBadge(inquiry.status) }
            </div>
            <button className='ps-2 pb-2 cursor-pointer' onClick={ closeTray }>
              <X className='text-gray-400 size-5'/>
            </button>
          </div>
          <div className='flex flex-col gap-4 py-6'>
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
        </>
      }
    </div>
  )
}

export default DetailsTray