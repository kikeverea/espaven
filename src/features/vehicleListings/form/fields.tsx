import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { INPUT } from '@/features/vehicleListings/styles'

type FieldProps = {
  label: string
  group?: boolean           // a few controls, not one: a click on the label would go to the first
  className?: string
  children: ReactNode
}

/* A control under its label */
export const Field = ({ label, group = false, className, children }: FieldProps) => {
  const Wrapper = group ? 'div' : 'label'

  return (
    <Wrapper className={ cn('flex min-w-0 flex-col gap-1.5', className) }>
      <span className='text-xs font-medium text-[#57534E]'>{ label }</span>
      { children }
    </Wrapper>
  )
}

type TextInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  suffix?: string                   // a unit at the end: '€', 'km', 'CV'
  invalid?: boolean
  inputMode?: 'numeric' | 'text'
  className?: string                // the input's
}

export const TextInput = ({ label, value, onChange, placeholder, suffix, invalid, inputMode, className }: TextInputProps) =>
  <span className='relative flex'>
    <input
      aria-label={ label }
      aria-invalid={ invalid || undefined }
      inputMode={ inputMode }
      value={ value }
      placeholder={ placeholder }
      onChange={ event => onChange(event.target.value) }
      className={ cn(INPUT, suffix && 'pe-10', invalid && 'border-[#D9443A] focus:border-[#D9443A]', className) }
    />
    { suffix && <span className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-[#78716C]'>{ suffix }</span> }
  </span>

type SegmentedProps<T extends string | number> = {
  label: string
  options: [ T, string ][]
  value: T | null
  onChange: (value: T | null) => void
}

/* One of a few, as chips side by side. The chosen one, picked again, is let go of */
export const Segmented = <T extends string | number>({ label, options, value, onChange }: SegmentedProps<T>) =>
  <div role='radiogroup' aria-label={ label } className='flex flex-wrap gap-1.5'>
    { options.map(([ option, text ]) =>
      <button
        key={ option }
        type='button'
        role='radio'
        aria-checked={ value === option }
        onClick={() => onChange(value === option ? null : option)}
        className={ cn('h-9 min-w-10 cursor-pointer rounded-[8px] border px-3 text-[13px] font-medium',
          value === option ? 'border-[#1C1917] bg-[#1C1917] text-white' : 'border-[#D6D3CF] bg-white text-[#44403C] hover:bg-[#F5F5F4]') }
      >
        { text }
      </button>
    )}
  </div>
