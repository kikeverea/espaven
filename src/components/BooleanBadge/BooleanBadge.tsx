import { Badge } from '@/components/ui/badge.tsx'

type BooleanBadgeProps = {
  bool: boolean
  trueMessage?: string
  falseMessage?: string
  trueColor?: string
  falseColor?: string
}

const BooleanBadge = ({
  bool,
  trueMessage = 'Sí',
  falseMessage = 'No',
  trueColor = 'bg-green-50 text-green-500 border-green-300',
  falseColor = 'bg-red-50 text-red-500 border-red-300'
}: BooleanBadgeProps) => {

  return (
    <Badge className={`rounded-md py-2 ${bool ? trueColor : falseColor}`}>
      {bool ? trueMessage : falseMessage}
    </Badge>
  )
}

export default BooleanBadge
