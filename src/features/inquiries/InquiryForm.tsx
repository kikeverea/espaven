import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import type { FormInquiry, Inquiry } from '@/features/inquiries/types.ts'
import { useInquiryMutations } from '@/features/inquiries/useInquiries.tsx'
import Form from '@/components/Form/Form.tsx'
import { config, applyData } from '@/features/inquiries/data/inquiry.form.ts'

type InquiryFormProps<T> = {
  inquiry: T | null
  onCancel: () => void
}

const InquiryForm = <T extends Inquiry | FormInquiry>({ inquiry, onCancel }: InquiryFormProps<T>) => {
  return (
    <div className={
      `grid justify-items-center
      transition-[grid-template-rows] duration-300
      ${inquiry ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`
    }>
      <Card className={`my-4 w-full xl:w-1/2 pt-0 min-h-0 transition-[padding,box-shadow] duration-300
        ${inquiry ? '' : 'py-0 ring-0'}`}>
        <CardHeader className='bg-primary/85 py-2 text-white'>
          <CardTitle className='text-center text-2xl font-semibold'>
            { (inquiry && 'id' in inquiry) ? 'Editar' : 'Nueva'} Solicitud
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form
            name='inquiry'
            config={ config }
            item={inquiry || {} as T}
            mutations={useInquiryMutations()}
            applyData={applyData}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default InquiryForm
