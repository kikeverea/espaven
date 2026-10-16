import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MONO } from '@/features/workOrders/timeline/util/styles'
import { hoursValue, parseHours } from '@/features/services/picker/hours'

const STEP = 15        // a quarter of an hour
const MIN = 15

type HoursStepperProps = {
  minutes: number
  onChange: (minutes: number) => void
  label?: string                      // what the hours are of, where steppers share a page: 'Purgado'
  className?: string
}

/* Labour in hours, by quarters: − [0,75] h +. What is typed takes once it leaves the input */
const HoursStepper = ({ minutes, onChange, label, className }: HoursStepperProps) => {
  const of = (name: string) => label ? `${name}, ${label}` : name

  const [ text, setText ] = useState(hoursValue(minutes))

  useEffect(() => { setText(hoursValue(minutes)) }, [ minutes ])

  const step = (by: number) => onChange(Math.max(MIN, minutes + by))

  const commit = () => {
    const typed = parseHours(text)
    if (typed === null) return setText(hoursValue(minutes))

    const rounded = Math.max(MIN, Math.round(typed / STEP) * STEP)
    setText(hoursValue(rounded))
    if (rounded !== minutes) onChange(rounded)
  }

  const button = 'grid size-8 cursor-pointer place-content-center rounded-[7px] border border-[#D6D3CF] bg-white text-[#57534E] hover:bg-[#F5F5F4] disabled:cursor-not-allowed disabled:bg-[#E7E5E2] disabled:text-[#A8A29E]'

  return (
    <div className={ cn('flex items-center gap-1.5', className) }>
      <button type='button' aria-label={ of('Menos horas') } disabled={ minutes <= MIN } onClick={() => step(-STEP)} className={ button }>
        <Minus className='size-3.5' />
      </button>
      <input
        aria-label={ of('Horas') }
        inputMode='decimal'
        value={ text }
        onChange={ event => setText(event.target.value) }
        onBlur={ commit }
        onKeyDown={ event => event.key === 'Enter' && commit() }
        className={ cn(MONO, 'h-8 w-[58px] rounded-[7px] border border-[#D6D3CF] bg-white px-1.5 text-center text-sm outline-none focus:border-[#3366E0]') }
      />
      <span className='text-xs text-[#78716C]'>h</span>
      <button type='button' aria-label={ of('Más horas') } onClick={() => step(STEP)} className={ button }>
        <Plus className='size-3.5' />
      </button>
    </div>
  )
}

export default HoursStepper
