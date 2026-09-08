import { useEffect, useRef } from 'react'

/*
 * Calls `callback` with the latest value once it has stopped changing for `delay` ms.
 * The first value is passed through untouched, so a table does not fire a request for
 * the empty search it starts with
 */
const useDebouncedCallback = <T,>(value: T, delay: number, callback: (value: T) => void) => {
  const latest = useRef(callback)
  const previous = useRef(value)

  latest.current = callback

  useEffect(() => {
    if (previous.current === value)
      return

    const timeout = setTimeout(() => {
      previous.current = value
      latest.current(value)
    }, delay)

    return () => clearTimeout(timeout)
  }, [value, delay])
}

export default useDebouncedCallback
