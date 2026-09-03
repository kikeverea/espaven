import type { ReactNode } from 'react'

const SideTray = ({ show, children }: { show: boolean, children: ReactNode }) => {
  return (
    <div className={`
      ${show ? 'w-[415px] px-4 py-5 border shadow-xl' : 'w-0 p-0 border-0'}
      h-full bg-background
      absolute top-0 bottom-0 inset-e-0
      lg:static lg:inset-auto
      transition-[width] duration-200 ease-in-out`}
    >
      { children }
    </div>
  )
}

export default SideTray