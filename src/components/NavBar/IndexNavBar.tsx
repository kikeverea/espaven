import { Plus, X } from 'lucide-react'
import NavBar from '@/components/NavBar/NavBar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { cn } from '@/lib/utils.ts'
import type { Entity } from '@/types.ts'

type IndexNavBarProps<T extends Entity> = {
  label: string
  createLabel: string
  /* useCollection's formItem. `get` is unused, but it is where T is inferred from */
  form: { id: () => T['id'] | null, get: () => T | null, set: (item: T | null) => void }
  className?: string             // 'xl:hidden' where the desktop form is always on screen
}

/* The bar of an index: opens a new item's form, and closes whichever form is open */
const IndexNavBar = <T extends Entity>({ label, createLabel, form, className }: IndexNavBarProps<T>) =>
  <NavBar
    label={ label }
    action={ form.id() == null       // not `!form.id()`: a new item's id is 0
      ? <Button variant='primary' className={ cn('me-2 px-4 py-4', className) } onClick={() => form.set({} as T)}>
          <Plus className='size-4' /> { createLabel }
        </Button>
      : <Button className={ cn('me-2 text-[13px] py-4', className) } onClick={() => form.set(null)}>
          <X className='size-4' /> Cerrar
        </Button>
    }
  />

export default IndexNavBar
