import { BlinkContext } from '@/components/Blinker/BlinkContext.tsx'
import { type ComponentProps, useContext } from 'react'
import { cn } from '@/lib/utils.ts'

const Blinker = ({ className }: ComponentProps<'div'>)=> {
  const blinkOn = useContext(BlinkContext)

  return (
    <div className={cn(
      className,
      'bg-red-500 rounded-full h-1 w-1',
      blinkOn ? 'visible' : 'invisible',
    )}>
    </div>
  )
}

export default Blinker