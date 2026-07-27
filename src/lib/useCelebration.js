import { useCallback, useRef, useState } from 'react'

export function useCelebration() {
  const [message, setMessage] = useState(null)
  const timeoutRef = useRef(null)

  const celebrate = useCallback((msg = 'Nice work!') => {
    setMessage(msg)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setMessage(null), 2200)
  }, [])

  return { message, celebrate }
}
