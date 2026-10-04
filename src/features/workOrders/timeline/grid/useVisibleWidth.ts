import { type RefObject, useEffect, useState } from 'react'

/* How wide `element` shows, measured on mount and whenever the window resizes. 0 until measured */
export const useVisibleWidth = (element: RefObject<HTMLElement | null>) => {
  const [ width, setWidth ] = useState(0)

  useEffect(() => {
    const measure = () => setWidth(element.current?.clientWidth ?? 0)

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [ element ])

  return width
}
