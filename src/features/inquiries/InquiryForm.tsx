import type { Inquiry } from '@/features/inquiries/types.ts'
import { useInquiryMutations } from '@/features/inquiries/useInquiries.tsx'
import { config } from '@/features/inquiries/data/inquiry.form.ts'
import CardForm from '@/components/Form/CardForm.tsx'
import type { FormCallbacks } from '@/components/Form/Form.tsx'

type InquiryFormProps = FormCallbacks & {
  inquiry: Partial<Inquiry> | null
}

const InquiryForm = ({ inquiry, onCreate, onUpdate, onCancel }: InquiryFormProps) => {
  return (
    <CardForm
      name='inquiry'
      itemName={['solicitud', 'f']}
      config={ config }
      item={inquiry}
      mutations={useInquiryMutations()}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onCancel={onCancel}
    />
  )
}

export default InquiryForm