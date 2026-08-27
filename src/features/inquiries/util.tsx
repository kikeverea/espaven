import { Badge } from '@/components/ui/badge.tsx'
import type { InquiryStatus } from '@/features/inquiries/types.ts'

type StatusStyle = {
  label: string
  className: string
}

export const inquiryStatusStyle = (
  status: InquiryStatus
): StatusStyle =>
{
  const styles: Record<InquiryStatus, StatusStyle> = {
    pending: {
      label: 'Nuevo',
      className: 'rounded-md py-3 bg-blue-50 text-blue-500 border-blue-300',
    },
    contacted: {
      label: 'Contactado',
      className: 'rounded-md py-3 bg-green-50 text-green-500 border-green-300',
    },
    secondContact: {
      label: 'Segundo contacto',
      className: 'rounded-md py-3 bg-violet-50 text-violet-700 border-violet-300',
    },
  }

  return styles[status] || { label: "???", className: 'bg-gray-50 text-gray-700 border-gray-300' }
}

export const statusBadge = (status: InquiryStatus) => {
  const { label, className } = inquiryStatusStyle(status)

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}