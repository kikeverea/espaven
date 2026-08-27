import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ArrowRightLeft } from 'lucide-react'
import { useInquiryMutations } from '@/features/inquiries/useInquiries'
import type { Inquiry, InquiryStatus } from '@/features/inquiries/types'
import { toast } from '@/components/ui/toast'
import { Spinner } from '@/components/ui/spinner.tsx'

const StatusDropdown = ({ inquiry }: { inquiry: Inquiry }) => {

  const { update, status } = useInquiryMutations()

  const changeStatus = (status: InquiryStatus) => {
    update(
      { id: inquiry.id, payload: { ...inquiry, status } },
      { onSuccess: () => toast.add({ title: 'Estado cambiado'})}
    )
  }

  const options: readonly [InquiryStatus, string][] = [
    ['pending', 'Nuevo'],
    ['contacted', 'Contactado'],
    ['secondContact', 'Segundo contacto'],
  ]

  return (
    <>
      { status.pending.current(inquiry)
        ? <Spinner />
        : <DropdownMenu>
            <DropdownMenuTrigger render={
              <div className='flex items-center group cursor-pointer'>
                <Button
                  size="icon"
                  variant='icon'
                  className='group-hover:rotate-180 transition-transform duration-200'
                >
                  <ArrowRightLeft className="size-4 " />
                </Button>
                <span className="
                  inline-block text-xs
                  origin-left scale-x-0 opacity-0
                  transition duration-200 ease-in-out
                  group-hover:scale-x-100 group-hover:opacity-100"
                >
                  Cambiar estado
                </span>
              </div>
            }>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              { options.map(([value, label]) =>
                <DropdownMenuItem
                  key={value}
                  className='p-0 cursor-pointer'
                  onClick={ () => changeStatus(value) }
                >
                  <div className='text-xs w-full px-2 py-2'>
                    { label }
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
      }
    </>
  )
}

export default StatusDropdown