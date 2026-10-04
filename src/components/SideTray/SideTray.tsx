import type { ReactNode } from 'react'
import { cn } from '@/lib/utils.ts'

type SideTrayProps = {
  show: boolean
  children: ReactNode
  className?: string      // while it shows: for content that lays out its own padding, 'p-0'
}

const SideTray = ({ show, children, className }: SideTrayProps) => {
  return (
    <div className={ cn(`
      ${show ? 'w-[415px] px-4 py-5 border shadow-xl' : 'w-0 p-0 border-0'}
      h-full bg-background
      absolute top-0 bottom-0 inset-e-0
      lg:static lg:inset-auto
      transition-[width] duration-200 ease-in-out`,
      show && className)}
    >
      { children }
    </div>
  )
}

export default SideTray
