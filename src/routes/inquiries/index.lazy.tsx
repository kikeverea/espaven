import { createLazyFileRoute } from '@tanstack/react-router'
import InquiriesIndex from '@/features/inquiries/InquiriesIndex.tsx'

export const Route = createLazyFileRoute('/inquiries/')({
  component: () => <InquiriesIndex />
})