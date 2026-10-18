import { useRef, useState, type ReactNode } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type PhotoDropProps = {
  label: string                     // the view it is for: '3/4 delantero'
  url?: string
  onFiles: (files: File[]) => void
  onRemove?: () => void
  multiple?: boolean
  children?: ReactNode              // instead of the label, while empty
}

const images = (files: FileList | null) => [ ...files ?? [] ].filter(file => file.type.startsWith('image/'))

/*
 * Where a photo goes: dropped on, or picked by a click. Once it has one, the photo and a × to take
 * it off; a new one dropped on it takes its place
 */
const PhotoDrop = ({ label, url, onFiles, onRemove, multiple = false, children }: PhotoDropProps) => {
  const input = useRef<HTMLInputElement>(null)
  const [ over, setOver ] = useState(false)

  const take = (files: File[]) => files.length && onFiles(multiple ? files : files.slice(0, 1))

  return (
    <div
      onDragOver={ event => { event.preventDefault(); setOver(true) } }
      onDragLeave={() => setOver(false)}
      onDrop={ event => { event.preventDefault(); setOver(false); take(images(event.dataTransfer.files)) } }
      className={ cn('group relative aspect-[4/3] overflow-hidden rounded-[10px]',
        over ? 'border-2 border-[#3366E0] bg-[#EEF3FD]'
          : url ? 'border border-[#DCD9D5]' : 'border border-dashed border-[#C9C5C0] bg-[#FBFAF9] hover:border-[#A8A29E]') }
    >
      <input
        ref={ input }
        type='file'
        accept='image/*'
        multiple={ multiple }
        aria-label={ `Foto ${label}` }
        onChange={ event => { take(images(event.target.files)); event.target.value = '' } }
        className='hidden'
      />

      { url && !over &&
        <>
          <img src={ url } alt={ label } className='size-full object-cover' />
          <span className='absolute bottom-1.5 left-1.5 rounded-[5px] bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white'>{ label }</span>
          { onRemove &&
            <button
              type='button'
              aria-label={ `Quitar foto ${label}` }
              onClick={ onRemove }
              className='absolute top-1.5 right-1.5 grid size-6 cursor-pointer place-content-center rounded-full bg-black/55 text-white hover:bg-black/75'
            >
              <X className='size-3.5' />
            </button>
          }
        </>
      }

      { (!url || over) &&
        <button
          type='button'
          onClick={() => input.current?.click()}
          className={ cn('flex size-full cursor-pointer flex-col items-center justify-center gap-1.5 px-2 text-center text-xs',
            over ? 'font-medium text-[#3366E0]' : 'text-[#78716C]') }
        >
          { over ? 'Suelta aquí' : <><ImagePlus className='size-5 text-[#A8A29E]' />{ children ?? label }</> }
        </button>
      }
    </div>
  )
}

export default PhotoDrop
