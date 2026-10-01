import { useRouter } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import EngineDeniedIcon from '@/components/icons/EngineDeniedIcon.tsx'

/* What a route shows to whoever its beforeLoad turned away */
const AccessDenied = () => {
  const router = useRouter()

  return (
    <div className='flex h-full flex-col items-center justify-center gap-4 px-5 text-center'>
      <EngineDeniedIcon className='size-24 text-muted-foreground' />
      <h1 className='text-xl font-semibold'>Acceso no permitido</h1>
      <p className='text-muted-foreground'>No tienes permiso para ver esta página.</p>
      <Button variant='outline' onClick={() => router.history.back()}>
        <ArrowLeft className='size-4' /> Volver
      </Button>
    </div>
  )
}

export default AccessDenied
