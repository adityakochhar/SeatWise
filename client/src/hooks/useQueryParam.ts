import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useQueryParam(name: string): [string | null, (value: string | null) => void] {
  const [params, setParams] = useSearchParams()
  const value = params.get(name)

  const setValue = useCallback(
    (next: string | null) => {
      setParams(
        (current) => {
          const updated = new URLSearchParams(current)
          if (next) {
            updated.set(name, next)
          } else {
            updated.delete(name)
          }
          return updated
        },
        { replace: true },
      )
    },
    [name, setParams],
  )

  return [value, setValue]
}
