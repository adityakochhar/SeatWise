import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { fetchMe, login as apiLogin, register as apiRegister, type LoginInput, type RegisterInput } from '@/api/auth'
import { ApiError, readToken, storeToken } from '@/api/client'
import type { AuthResponse, PublicUser } from '@/types/api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(() => readToken() !== null)

  function applySession(session: AuthResponse | null) {
    storeToken(session?.token ?? null)
    setUser(session?.user ?? null)
  }

  useEffect(() => {
    if (!readToken()) return
    let cancelled = false

    fetchMe()
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch((error: unknown) => {
        if (!cancelled && error instanceof ApiError && error.status === 401) applySession(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function login(input: LoginInput) {
    applySession(await apiLogin(input))
  }

  async function register(input: RegisterInput) {
    applySession(await apiRegister(input))
  }

  function logout() {
    applySession(null)
    queryClient.clear()
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}
