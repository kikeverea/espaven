import Blinker from '@/components/Blinker/Blinker.tsx'
import { useHasNewInquiries } from '@/features/inquiries/useInquiries.tsx'

/* On the Solicitudes link's icon while there are new inquiries. Only mounted for who sees the link */
const NewInquiriesBlinker = () => {
  const { data: hasNew } = useHasNewInquiries()
  return hasNew && <Blinker className='absolute top-1.5 left-5' />
}

export default NewInquiriesBlinker
