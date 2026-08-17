import { type JSX } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar.tsx'

type NavBarProps = {
  action?: JSX.Element | null
  actions?: JSX.Element[]
  label: string | JSX.Element
}

const NavBar = ({ label, action, actions }: NavBarProps) => {

  const barActions = actions ? actions : [action]

  return (
    <nav className='w-full h-12.5 flex gap-4 items-end bg-background'>
      <SidebarTrigger className="cursor-pointer" />
      <h1 className='text-xl font-semibold mt-2 flex-1'>
        { label }
      </h1>
      { barActions
        .filter(action => !!action)
        .map(action =>
          <div key={ barActions.length > 1 ? action.key : 'single-action'}>
            { action }
          </div>
        )}
    </nav>
  )
}

export default NavBar