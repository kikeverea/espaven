import { useId, type ComponentProps } from 'react'

/*
 * An engine, lucide style, with a ban sign over its corner. The engine takes the text colour,
 * the sign the destructive one, and the engine's lines are masked off around the sign
 */
const EngineDeniedIcon = (props: ComponentProps<'svg'>) => {
  const mask = useId()

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={ 2 }
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      { ...props }
    >
      <defs>
        <mask id={ mask }>
          <rect width='24' height='24' fill='white' />
          <circle cx='17.5' cy='17.5' r='6.5' fill='black' />
        </mask>
      </defs>

      <g mask={ `url(#${mask})` }>
        <path d='M10 4h5' />
        <path d='M12.5 4v3' />
        <path d='M3 11v4' />
        <path d='M3 13h3' />
        <path d='M6 9h2l2-2h5l2 2h1v2h2v-1h1v6h-1v-1h-2v2h-2l-2 2H9l-2-2H6z' />
      </g>

      <g className='text-destructive'>
        <circle cx='17.5' cy='17.5' r='5' />
        <path d='m13.96 13.96 7.08 7.08' />
      </g>
    </svg>
  )
}

export default EngineDeniedIcon
