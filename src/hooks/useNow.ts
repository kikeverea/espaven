import { useEffect, useState } from 'react'

/* The current time, a minute at most behind */
export const useNow = () => {
  const [ now, setNow ] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  return now
}
