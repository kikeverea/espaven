import { createContext, type ReactNode, useEffect, useState } from 'react'

export const BlinkContext = createContext(false)

export const BlinkProvider = ({ children }: { children: ReactNode }) => {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setOn(value => !value)
    }, 500)

    return () => clearInterval(timer)
  }, [])

  return (
    <BlinkContext.Provider value={on}>
      {children}
    </BlinkContext.Provider>
  )
}