import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils.ts'

type NavButtonProps = ComponentProps<'button'> & { label?: string }

/* A day navigation button, on the toolbar's charcoal */
const NavButton = ({ label, className, children, ...props }: NavButtonProps) =>
  <button
    type='button'
    aria-label={ label }
    className={ cn(
      'inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg border border-[#57514C] bg-[#46403B] text-[13px] font-medium text-[#D6D3D1] transition-colors hover:bg-[#524B45] disabled:cursor-default disabled:opacity-50 disabled:hover:bg-[#46403B]',
      className
    )}
    { ...props }
  >
    { children }
  </button>

export default NavButton
