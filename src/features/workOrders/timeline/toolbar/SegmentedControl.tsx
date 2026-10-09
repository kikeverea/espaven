import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'

type SegmentedControlProps<T extends string | number> = {
  label: string
  options: { value: T, label: string }[]
  value: T | undefined
  onChange: (value: T) => void
}

/*
 * A segmented control sunk into a charcoal toolbar: the chosen option white. With no value yet,
 * null rather than undefined, so it is controlled from the start and takes the value when it comes
 */
const SegmentedControl = <T extends string | number>({ label, options, value, onChange }: SegmentedControlProps<T>) =>
  <Tabs value={ value ?? null } onValueChange={ value => onChange(value as T) }>
    <TabsList aria-label={ label } className='h-auto gap-0.5 rounded-lg bg-[#2C2825] p-0.75'>
      { options.map(({ value, label }) =>
        <TabsTrigger
          key={ value }
          value={ value }
          className='
            h-6.5 flex-none rounded-md border-0 px-2.5 text-xs font-medium cursor-pointer
            text-[#C4BEB8] hover:text-white data-active:bg-white data-active:shadow-[0_1px_2px_rgba(28,25,23,.12)]'
        >
          { label }
        </TabsTrigger>
      )}
    </TabsList>
  </Tabs>

export default SegmentedControl
