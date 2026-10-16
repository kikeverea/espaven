import { useState } from 'react'
import { X } from 'lucide-react'
import type { Contact } from '@/features/inquiries/types'
import { fullName, phoneOf, useClients } from '@/features/clients/useClients'
import useDebouncedCallback from '@/components/Table/hooks/useDebouncedCallback'

type ClientSelectProps = {
  client: Contact | null
  onChange: (client: Contact | null) => void
  className: string             // the input's, to look like the form's other fields
}

/* A client, found by name as it is typed. The one picked shows in its place, to clear */
const ClientSelect = ({ client, onChange, className }: ClientSelectProps) => {
  const [ text, setText ] = useState('')
  const [ search, setSearch ] = useState('')
  const [ open, setOpen ] = useState(false)

  useDebouncedCallback(text.trim(), 250, setSearch)

  const { data, isFetching } = useClients({ search, perPage: 8 })
  const found = open && search ? data?.collection ?? [] : []

  if (client)
    return (
      <div className={ `${className} flex items-center justify-between gap-2` }>
        <span className='truncate'>{ fullName(client) }</span>
        <button type='button' aria-label='Quitar cliente' onClick={() => onChange(null)} className='grid size-6 cursor-pointer place-content-center rounded text-[#78716C] hover:bg-[#F1EFEC]'>
          <X className='size-3.5' />
        </button>
      </div>
    )

  return (
    <div className='relative'>
      <input
        role='combobox'
        aria-label='Cliente'
        aria-expanded={ found.length > 0 }
        aria-controls='client-options'
        placeholder='Busca por nombre y apellidos'
        value={ text }
        onChange={ event => { setText(event.target.value); setOpen(true) } }
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={ `${className} w-full` }
      />
      { open && search && !isFetching && !found.length &&
        <p className='absolute inset-x-0 top-full z-10 mt-1 rounded-[8px] border border-[#DCD9D5] bg-white px-3 py-2 text-[13px] text-[#78716C] shadow-md'>
          Ningún cliente se llama así.
        </p>
      }
      { found.length > 0 &&
        <ul id='client-options' role='listbox' aria-label='Clientes' className='absolute inset-x-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-[8px] border border-[#DCD9D5] bg-white py-1 shadow-md'>
          { found.map(option =>
            <li
              key={ option.id }
              role='option'
              aria-selected={ false }
              onMouseDown={ event => event.preventDefault() }     // keeps the input's focus until it is picked
              onClick={() => { onChange(option); setText(''); setOpen(false) }}
              className='flex cursor-pointer items-baseline justify-between gap-3 px-3 py-2 text-sm hover:bg-[#F5F5F4]'
            >
              <span>{ fullName(option) }</span>
              { phoneOf(option) && <span className='text-xs text-[#78716C]'>{ phoneOf(option) }</span> }
            </li>
          )}
        </ul>
      }
    </div>
  )
}

export default ClientSelect
