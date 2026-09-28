import { useEffect, useState } from 'react'

export function useCountdown(target: string | null | undefined) {
  const targetMs = target ? new Date(target).getTime() : null
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (targetMs === null) return
    setNow(Date.now())
    const id = window.setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= targetMs) window.clearInterval(id)
    }, 1000)
    return () => window.clearInterval(id)
  }, [targetMs])

  const remainingMs = targetMs === null ? 0 : Math.max(0, targetMs - now)
  return { remainingMs, expired: targetMs !== null && remainingMs === 0 }
}
